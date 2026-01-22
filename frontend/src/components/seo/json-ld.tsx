interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebApplicationJsonLd({ locale }: { locale: string }) {
  const isKorean = locale === 'ko';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NameTag Pro',
    description: isKorean
      ? '명단만 있으면 명찰 완성. 엑셀 업로드 한 번으로 수백 장의 명찰을 자동 생성하세요.'
      : 'Just upload your list and get nametags. Generate hundreds of nametags automatically with a single Excel upload.',
    url: `https://nametag-pro.vercel.app/${locale}`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: isKorean ? '50명까지 무료' : 'Free for up to 50 people',
    },
    featureList: isKorean
      ? ['엑셀/CSV 업로드', '드래그 앤 드롭 에디터', '고해상도 PDF 생성', '다국어 지원']
      : ['Excel/CSV Upload', 'Drag & Drop Editor', 'High-Resolution PDF', 'Multi-language Support'],
    screenshot: 'https://nametag-pro.vercel.app/opengraph-image',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return <JsonLd data={data} />;
}

export function FAQJsonLd({ locale }: { locale: string }) {
  const isKorean = locale === 'ko';

  const faqItems = isKorean
    ? [
        {
          question: '명찰 프로는 무료인가요?',
          answer:
            '네, 50명까지 완전 무료로 사용할 수 있습니다. 신용카드 등록도 필요 없습니다. 더 많은 인원이 필요한 경우 유료 플랜을 이용하실 수 있습니다.',
        },
        {
          question: '어떤 파일 형식을 지원하나요?',
          answer:
            '명단은 Excel(.xlsx, .xls)과 CSV 파일을 지원합니다. 디자인 템플릿은 JPG, PNG 이미지를 업로드할 수 있습니다.',
        },
        {
          question: '명찰 크기를 조절할 수 있나요?',
          answer:
            '네, 명함 크기(90x50mm)부터 대형 명찰(100x150mm)까지 다양한 크기를 지원합니다. 원하는 크기를 직접 입력할 수도 있습니다.',
        },
        {
          question: '한 번에 몇 장까지 만들 수 있나요?',
          answer:
            '무료 플랜에서는 50명까지, 유료 플랜에서는 제한 없이 명찰을 생성할 수 있습니다. 수백 장의 명찰도 몇 초 만에 PDF로 생성됩니다.',
        },
        {
          question: '역할별로 다른 디자인을 적용할 수 있나요?',
          answer:
            '네, 명단의 특정 컬럼(예: 직책, 소속)을 기준으로 각 역할에 다른 디자인이나 색상을 자동으로 적용할 수 있습니다.',
        },
      ]
    : [
        {
          question: 'Is NameTag Pro free?',
          answer:
            'Yes, you can use it completely free for up to 50 people. No credit card required. For larger groups, paid plans are available.',
        },
        {
          question: 'What file formats are supported?',
          answer:
            'For rosters, we support Excel (.xlsx, .xls) and CSV files. For design templates, you can upload JPG and PNG images.',
        },
        {
          question: 'Can I adjust the nametag size?',
          answer:
            'Yes, we support various sizes from business card size (90x50mm) to large badges (100x150mm). You can also enter custom dimensions.',
        },
        {
          question: 'How many nametags can I create at once?',
          answer:
            'Free plan allows up to 50 people, while paid plans have no limits. Hundreds of nametags can be generated as PDF in seconds.',
        },
        {
          question: 'Can I apply different designs per role?',
          answer:
            'Yes, you can automatically apply different designs or colors based on a specific column in your roster (e.g., job title, department).',
        },
      ];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NameTag Pro',
    url: 'https://nametag-pro.vercel.app',
    logo: 'https://nametag-pro.vercel.app/icon',
    sameAs: [],
  };

  return <JsonLd data={data} />;
}
