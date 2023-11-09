import { I18n } from 'i18n-js';
import { en } from './translate/en';
import { vi } from './translate/vi';

const i18n = new I18n();
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.translations = { en, vi };
i18n.locale = 'en';

export default i18n;
