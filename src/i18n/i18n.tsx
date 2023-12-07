import { I18n } from 'i18n-js';
import { en } from './translate/en';
import { vi } from './translate/vi';

const currentLanguage = localStorage.getItem('i18n');

const i18n = new I18n();
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.translations = { en, vi };
if (currentLanguage) {
    i18n.locale = currentLanguage;
} else {
    i18n.locale = 'en';
}

i18n.store(en);
i18n.store(vi);

i18n.onChange(() => {
    console.log('I18n has changed!');
});

export default i18n;
