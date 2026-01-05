/**
 * Image Upload Service for Question Images
 * Handles uploading images to Firebase Storage and generating public URLs
 */

import { storage } from '../backend/firebaseHandler';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload a single image to Firebase Storage
 * @param {Buffer|string} imageData - Image data as Buffer or base64 string
 * @param {string} contentType - MIME type (e.g., 'image/png')
 * @param {string} teacherUid - Teacher's UID for organizing uploads
 * @param {number} imageIndex - Index of the image in the document
 * @returns {Promise<string>} - Public download URL
 */
export async function uploadQuestionImage(imageData, contentType, teacherUid, imageIndex) {
    try {
        // Convert base64 string to Buffer if needed
        let buffer;
        if (typeof imageData === 'string') {
            buffer = Buffer.from(imageData, 'base64');
        } else {
            buffer = imageData;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = contentType.split('/')[1] || 'png';
        const filename = `image-${imageIndex}-${timestamp}.${extension}`;

        // Create storage path: question-images/{teacherUid}/{timestamp}/{filename}
        const storagePath = `question-images/${teacherUid}/${timestamp}/${filename}`;
        const storageRef = ref(storage, storagePath);

        // Upload the image
        console.log(`📤 Uploading image ${imageIndex} to Firebase Storage...`);
        const snapshot = await uploadBytes(storageRef, buffer, {
            contentType: contentType
        });

        // Get public download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`✅ Image ${imageIndex} uploaded successfully`);

        return downloadURL;
    } catch (error) {
        console.error(`❌ Error uploading image ${imageIndex}:`, error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

/**
 * Upload multiple images to Firebase Storage
 * @param {Array<Object>} images - Array of image objects with buffer and contentType
 * @param {string} teacherUid - Teacher's UID
 * @returns {Promise<Array<string>>} - Array of public download URLs
 */
export async function uploadQuestionImages(images, teacherUid) {
    try {
        console.log(`📤 Uploading ${images.length} images to Firebase Storage...`);

        const uploadPromises = images.map((image, index) =>
            uploadQuestionImage(image.buffer, image.contentType, teacherUid, index)
        );

        const urls = await Promise.all(uploadPromises);
        console.log(`✅ Successfully uploaded ${urls.length} images`);

        return urls;
    } catch (error) {
        console.error('❌ Error uploading images:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
}

/**
 * Associate uploaded images with questions
 * Simple strategy: Distribute images across questions that mention images
 * @param {Array<Object>} questions - Array of question objects
 * @param {Array<string>} imageUrls - Array of image URLs
 * @returns {Array<Object>} - Questions with image URLs attached
 */
export function associateImagesWithQuestions(questions, imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
        return questions;
    }

    console.log(`🔗 Associating ${imageUrls.length} images with ${questions.length} questions...`);

    // Strategy: Assign images sequentially to questions
    // More sophisticated logic can be added later (e.g., based on question content)
    let imageIndex = 0;

    questions.forEach((question, qIndex) => {
        if (imageIndex < imageUrls.length) {
            // Assign image to this question
            question.imageUrl = imageUrls[imageIndex];
            question.hasImage = true;
            console.log(`  Question ${qIndex + 1} → Image ${imageIndex + 1}`);
            imageIndex++;
        }
    });

    console.log(`✅ Associated ${imageIndex} images with questions`);
    return questions;
}
