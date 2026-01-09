import { NextResponse } from 'next/server';
import { extractQuestionsWithAI, validateExtractedQuestions, associateImagesWithQuestions } from '@/services/aiQuestionExtractor';
import { generateMockQuestions, validateExtractedQuestions as validateMockQuestions, associateImagesWithQuestions as associateMockImages } from '@/services/demoQuestionExtractor';

// Enable demo mode if Gemini API is not working
const USE_DEMO_MODE = process.env.USE_DEMO_MODE === 'true' || false;

/**
 * POST /api/upload-document
 * Upload and process PDF/Word document to extract questions
 */
export async function POST(request) {
    try {
        // Get form data
        const formData = await request.formData();
        const file = formData.get('file');
        const subject = formData.get('subject');

        // Validate inputs
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!subject || !['physics', 'chemistry', 'biology'].includes(subject)) {
            return NextResponse.json(
                { error: 'Invalid subject. Must be physics, chemistry, or biology' },
                { status: 400 }
            );
        }

        // Get file details
        const fileName = file.name || '';
        const fileExt = fileName.toLowerCase().split('.').pop();
        const allowedExtensions = ['pdf', 'doc', 'docx'];

        console.log('📄 File upload details:', {
            name: fileName,
            type: file.type,
            extension: fileExt,
            size: `${(file.size / 1024).toFixed(2)} KB`
        });

        // Validate file extension (more reliable than MIME type)
        if (!allowedExtensions.includes(fileExt)) {
            console.error('❌ Invalid file extension:', fileExt);
            return NextResponse.json(
                {
                    error: 'Invalid file type. Only PDF (.pdf) and Word (.doc, .docx) documents are allowed.',
                    details: `File extension: .${fileExt}`
                },
                { status: 400 }
            );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Step 1: Parse document to extract text
        console.log('📖 Parsing document...');
        let text = '';
        let images = [];
        let metadata = {};

        try {
            const isPDF = fileExt === 'pdf';
            const isWord = fileExt === 'doc' || fileExt === 'docx';

            if (isPDF) {
                console.log('📑 Processing as PDF...');
                const pdf = require('pdf-parse');
                const pdfData = await pdf(buffer);
                text = pdfData.text;
                metadata = {
                    pageCount: pdfData.numpages,
                    info: pdfData.info
                };
                console.log(`✅ Extracted ${text.length} characters from ${pdfData.numpages} pages`);
            } else if (isWord) {
                console.log('📝 Processing as Word document...');
                const mammoth = require('mammoth');

                // Track image index for placeholders
                let imageCounter = 0;

                // Extract HTML with image placeholders
                const options = {
                    convertImage: mammoth.images.imgElement(function (image) {
                        return image.read("base64").then(function (imageBuffer) {
                            const currentIndex = imageCounter++;
                            // Store image data for later use
                            images.push({
                                index: currentIndex,
                                buffer: imageBuffer,
                                contentType: image.contentType || 'image/png',
                                altText: image.altText || ''
                            });
                            // Return placeholder that will appear in HTML
                            return {
                                src: `[IMAGE_PLACEHOLDER_${currentIndex}]`
                            };
                        });
                    })
                };

                // Extract HTML with placeholders
                const htmlData = await mammoth.convertToHtml({ buffer: buffer }, options);

                // Convert HTML to text with image placeholders preserved
                // Replace <img src="[IMAGE_PLACEHOLDER_X]"> with [IMAGE_X]
                let htmlContent = htmlData.value;
                htmlContent = htmlContent.replace(/<img[^>]*src="\[IMAGE_PLACEHOLDER_(\d+)\]"[^>]*>/g, '[IMAGE_$1]');

                // Strip remaining HTML tags but keep the text and [IMAGE_X] placeholders
                text = htmlContent
                    .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
                    .replace(/&nbsp;/g, ' ')   // Replace HTML entities
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\s+/g, ' ')      // Normalize whitespace
                    .trim();

                metadata = {
                    messages: htmlData.messages,
                    imageCount: images.length
                };
                console.log(`✅ Extracted ${text.length} characters from Word document`);
                console.log(`📸 Found ${images.length} images in document`);
                console.log(`📍 Image placeholders in text: ${(text.match(/\[IMAGE_\d+\]/g) || []).length}`);
            } else {
                throw new Error(`Unsupported file extension: .${fileExt}`);
            }
        } catch (parseError) {
            console.error('❌ Error parsing document:', parseError);
            return NextResponse.json(
                {
                    error: 'Failed to parse document',
                    details: parseError.message
                },
                { status: 500 }
            );
        }

        if (!text || text.trim().length === 0) {
            console.error('❌ No text extracted from document');
            return NextResponse.json(
                { error: 'Could not extract text from document. The file may be empty or corrupted.' },
                { status: 400 }
            );
        }

        console.log(`📊 Total text extracted: ${text.length} characters`);

        // Step 2: Use AI to extract questions from text (with demo mode fallback)
        console.log('🤖 Extracting questions with AI...');
        let questions;
        let usedDemoMode = false;

        if (USE_DEMO_MODE) {
            console.log('🎭 DEMO MODE: Using mock questions');
            questions = generateMockQuestions(text, subject);
            usedDemoMode = true;
        } else {
            try {
                questions = await extractQuestionsWithAI(text, subject);
            } catch (aiError) {
                console.error('❌ AI extraction error:', aiError.message);
                console.log('🎭 Falling back to DEMO MODE with mock questions');
                questions = generateMockQuestions(text, subject);
                usedDemoMode = true;
            }
        }

        if (!questions || questions.length === 0) {
            console.error('❌ No questions found by AI');
            return NextResponse.json(
                {
                    error: 'No questions found in document. Please check the document format.',
                    hint: 'Make sure questions are clearly formatted with options A, B, C, D and correct answers marked.'
                },
                { status: 400 }
            );
        }

        console.log(`✅ Extracted ${questions.length} questions`);

        // Step 3: Associate images with questions using imageIndex from AI
        if (images && images.length > 0) {
            console.log(`🖼️  Processing ${images.length} images...`);

            // Convert images to data URLs
            const imageDataUrls = images.map(img => ({
                index: img.index,
                url: `data:${img.contentType};base64,${img.buffer}`
            }));

            // Count how many questions have imageIndex specified
            const questionsWithImageIndex = questions.filter(q => typeof q.imageIndex === 'number');
            console.log(`📌 Found ${questionsWithImageIndex.length} questions with imageIndex specified`);

            if (questionsWithImageIndex.length > 0) {
                // Use AI-specified imageIndex for precise association
                questions.forEach((question) => {
                    if (typeof question.imageIndex === 'number') {
                        const imageData = imageDataUrls.find(img => img.index === question.imageIndex);
                        if (imageData) {
                            question.imageUrl = imageData.url;
                            console.log(`  ✓ Question ${question.no} → Image ${question.imageIndex} (AI-specified)`);
                        } else {
                            console.warn(`  ⚠️ Question ${question.no} references Image ${question.imageIndex} but not found`);
                        }
                    }
                });
            } else if (questions.some(q => q.hasImage)) {
                // Fallback: AI marked hasImage but no imageIndex - use sequential assignment
                console.log(`ℹ️  No imageIndex specified, using sequential assignment for hasImage questions...`);
                let imageIdx = 0;
                questions.forEach((question) => {
                    if (question.hasImage && imageIdx < imageDataUrls.length) {
                        question.imageUrl = imageDataUrls[imageIdx].url;
                        console.log(`  ✓ Question ${question.no} → Image ${imageIdx} (sequential fallback)`);
                        imageIdx++;
                    }
                });
            } else {
                console.log(`ℹ️  No questions marked with images, skipping image assignment`);
            }
        } else {
            console.log('ℹ️  No images found in document');
        }

        // Step 4: Validate extracted questions
        const validation = validateExtractedQuestions(questions);

        if (!validation.valid) {
            console.warn('⚠️ Validation warnings:', validation.errors);
        }

        console.log('🎉 Document processing complete!');

        // Return extracted questions for preview
        return NextResponse.json({
            success: true,
            questions,
            demoMode: usedDemoMode,
            metadata: {
                totalQuestions: questions.length,
                documentInfo: metadata,
                validation: validation,
                imagesFound: images.length,
                mode: usedDemoMode ? 'demo' : 'ai'
            }
        });

    } catch (error) {
        console.error('💥 Unexpected error processing document:', error);
        return NextResponse.json(
            {
                error: 'Failed to process document',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
