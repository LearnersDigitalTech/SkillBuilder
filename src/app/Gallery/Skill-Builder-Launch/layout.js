export const metadata = {
    title: 'Launch of Math Skill Builder - Learners Digital',
    description: 'Watch the exciting launch of Learners Digital\'s Math Skill Builder - revolutionizing math education with interactive practice and assessments.',
    openGraph: {
        title: 'Launch of Math Skill Builder - Learners Digital',
        description: 'Watch the exciting launch of Learners Digital\'s Math Skill Builder - revolutionizing math education with interactive practice and assessments.',
        images: [
            {
                url: 'https://img.youtube.com/vi/BnYiNL81S-s/maxresdefault.jpg',
                width: 1280,
                height: 720,
                alt: 'Math Skill Builder Launch Video Thumbnail',
            },
            {
                url: 'https://img.youtube.com/vi/BnYiNL81S-s/sddefault.jpg',
                width: 640,
                height: 480,
                alt: 'Math Skill Builder Launch Video Thumbnail',
            },
        ],
        type: 'video.other',
        siteName: 'Learners Digital',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Launch of Math Skill Builder - Learners Digital',
        description: 'Watch the exciting launch of Learners Digital\'s Math Skill Builder - revolutionizing math education.',
        images: ['https://img.youtube.com/vi/BnYiNL81S-s/maxresdefault.jpg'],
    },
};

export default function SkillBuilderLaunchLayout({ children }) {
    return children;
}
