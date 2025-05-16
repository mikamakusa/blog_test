import { useTranslation } from 'react-i18next';

export default function TranslatedContent() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
    </div>
  );
} 