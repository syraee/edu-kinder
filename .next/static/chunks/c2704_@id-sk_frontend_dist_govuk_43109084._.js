(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/govuk-frontend-version.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "version",
    ()=>version
]);
const version = '3.0.0-beta.0';
;
 //# sourceMappingURL=govuk-frontend-version.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-string.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normaliseString",
    ()=>normaliseString
]);
function normaliseString(value, property) {
    const trimmedValue = value ? value.trim() : '';
    let output;
    let outputType = property == null ? void 0 : property.type;
    if (!outputType) {
        if ([
            'true',
            'false'
        ].includes(trimmedValue)) {
            outputType = 'boolean';
        }
        if (trimmedValue.length > 0 && isFinite(Number(trimmedValue))) {
            outputType = 'number';
        }
    }
    switch(outputType){
        case 'boolean':
            output = trimmedValue === 'true';
            break;
        case 'number':
            output = Number(trimmedValue);
            break;
        default:
            output = value;
    }
    return output;
}
;
 //# sourceMappingURL=normalise-string.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractConfigByNamespace",
    ()=>extractConfigByNamespace,
    "getBreakpoint",
    ()=>getBreakpoint,
    "getFragmentFromUrl",
    ()=>getFragmentFromUrl,
    "isSupported",
    ()=>isSupported,
    "mergeConfigs",
    ()=>mergeConfigs,
    "setFocus",
    ()=>setFocus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$string$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-string.mjs [app-client] (ecmascript)");
;
function mergeConfigs() {
    for(var _len = arguments.length, configObjects = new Array(_len), _key = 0; _key < _len; _key++){
        configObjects[_key] = arguments[_key];
    }
    const formattedConfigObject = {};
    for (const configObject of configObjects){
        for (const key of Object.keys(configObject)){
            const option = formattedConfigObject[key];
            const override = configObject[key];
            if (isObject(option) && isObject(override)) {
                formattedConfigObject[key] = mergeConfigs(option, override);
            } else {
                formattedConfigObject[key] = override;
            }
        }
    }
    return formattedConfigObject;
}
function extractConfigByNamespace(Component, dataset, namespace) {
    const property = Component.schema.properties[namespace];
    if ((property == null ? void 0 : property.type) !== 'object') {
        return;
    }
    const newObject = {
        [namespace]: {}
    };
    for (const [key, value] of Object.entries(dataset)){
        let current = newObject;
        const keyParts = key.split('.');
        for (const [index, name] of keyParts.entries()){
            if (typeof current === 'object') {
                if (index < keyParts.length - 1) {
                    if (!isObject(current[name])) {
                        current[name] = {};
                    }
                    current = current[name];
                } else if (key !== namespace) {
                    current[name] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$string$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseString"])(value);
                }
            }
        }
    }
    return newObject[namespace];
}
function getFragmentFromUrl(url) {
    if (!url.includes('#')) {
        return undefined;
    }
    return url.split('#').pop();
}
function getBreakpoint(name) {
    const property = "--govuk-frontend-breakpoint-".concat(name);
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(property);
    return {
        property,
        value: value || undefined
    };
}
function setFocus($element) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _options$onBeforeFocu;
    const isFocusable = $element.getAttribute('tabindex');
    if (!isFocusable) {
        $element.setAttribute('tabindex', '-1');
    }
    function onFocus() {
        $element.addEventListener('blur', onBlur, {
            once: true
        });
    }
    function onBlur() {
        var _options$onBlur;
        (_options$onBlur = options.onBlur) == null || _options$onBlur.call($element);
        if (!isFocusable) {
            $element.removeAttribute('tabindex');
        }
    }
    $element.addEventListener('focus', onFocus, {
        once: true
    });
    (_options$onBeforeFocu = options.onBeforeFocus) == null || _options$onBeforeFocu.call($element);
    $element.focus();
}
function isSupported() {
    let $scope = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document.body;
    if (!$scope) {
        return false;
    }
    return $scope.classList.contains('govuk-frontend-supported');
}
function isArray(option) {
    return Array.isArray(option);
}
function isObject(option) {
    return !!option && typeof option === 'object' && !isArray(option);
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-dataset.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normaliseDataset",
    ()=>normaliseDataset
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$string$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-string.mjs [app-client] (ecmascript)");
;
;
function normaliseDataset(Component, dataset) {
    const out = {};
    for (const [field, property] of Object.entries(Component.schema.properties)){
        if (field in dataset) {
            out[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$string$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseString"])(dataset[field], property);
        }
        if ((property == null ? void 0 : property.type) === 'object') {
            out[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractConfigByNamespace"])(Component, dataset, field);
        }
    }
    return out;
}
;
 //# sourceMappingURL=normalise-dataset.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ElementError",
    ()=>ElementError,
    "GOVUKFrontendError",
    ()=>GOVUKFrontendError,
    "SupportError",
    ()=>SupportError
]);
class GOVUKFrontendError extends Error {
    constructor(...args){
        super(...args);
        this.name = 'GOVUKFrontendError';
    }
}
class SupportError extends GOVUKFrontendError {
    /**
   * Checks if GOV.UK Frontend is supported on this page
   *
   * @param {HTMLElement | null} [$scope] - HTML element `<body>` checked for browser support
   */ constructor($scope = document.body){
        const supportMessage = 'noModule' in HTMLScriptElement.prototype ? 'GOV.UK Frontend initialised without `<body class="govuk-frontend-supported">` from template `<script>` snippet' : 'GOV.UK Frontend is not supported in this browser';
        super($scope ? supportMessage : 'GOV.UK Frontend initialised without `<script type="module">`');
        this.name = 'SupportError';
    }
}
class ElementError extends GOVUKFrontendError {
    constructor(messageOrOptions){
        let message = typeof messageOrOptions === 'string' ? messageOrOptions : '';
        if (typeof messageOrOptions === 'object') {
            const { componentName, identifier, element, expectedType } = messageOrOptions;
            message = "".concat(componentName, ": ").concat(identifier);
            message += element ? " is not of type ".concat(expectedType != null ? expectedType : 'HTMLElement') : ' not found';
        }
        super(message);
        this.name = 'ElementError';
    }
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GOVUKFrontendComponent",
    ()=>GOVUKFrontendComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
;
;
class GOVUKFrontendComponent {
    checkSupport() {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupported"])()) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SupportError"]();
        }
    }
    constructor(){
        this.checkSupport();
    }
}
;
 //# sourceMappingURL=govuk-frontend-component.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/i18n.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "I18n",
    ()=>I18n
]);
class I18n {
    t(lookupKey, options) {
        if (!lookupKey) {
            throw new Error('i18n: lookup key missing');
        }
        let translation = this.translations[lookupKey];
        if (typeof (options == null ? void 0 : options.count) === 'number' && typeof translation === 'object') {
            const translationPluralForm = translation[this.getPluralSuffix(lookupKey, options.count)];
            if (translationPluralForm) {
                translation = translationPluralForm;
            }
        }
        if (typeof translation === 'string') {
            if (translation.match(/%{(.\S+)}/)) {
                if (!options) {
                    throw new Error('i18n: cannot replace placeholders in string if no option data provided');
                }
                return this.replacePlaceholders(translation, options);
            }
            return translation;
        }
        return lookupKey;
    }
    replacePlaceholders(translationString, options) {
        const formatter = Intl.NumberFormat.supportedLocalesOf(this.locale).length ? new Intl.NumberFormat(this.locale) : undefined;
        return translationString.replace(/%{(.\S+)}/g, function(placeholderWithBraces, placeholderKey) {
            if (Object.prototype.hasOwnProperty.call(options, placeholderKey)) {
                const placeholderValue = options[placeholderKey];
                if (placeholderValue === false || typeof placeholderValue !== 'number' && typeof placeholderValue !== 'string') {
                    return '';
                }
                if (typeof placeholderValue === 'number') {
                    return formatter ? formatter.format(placeholderValue) : "".concat(placeholderValue);
                }
                return placeholderValue;
            }
            throw new Error("i18n: no data found to replace ".concat(placeholderWithBraces, " placeholder in string"));
        });
    }
    hasIntlPluralRulesSupport() {
        return Boolean('PluralRules' in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length);
    }
    getPluralSuffix(lookupKey, count) {
        count = Number(count);
        if (!isFinite(count)) {
            return 'other';
        }
        const translation = this.translations[lookupKey];
        const preferredForm = this.hasIntlPluralRulesSupport() ? new Intl.PluralRules(this.locale).select(count) : this.selectPluralFormUsingFallbackRules(count);
        if (typeof translation === 'object') {
            if (preferredForm in translation) {
                return preferredForm;
            } else if ('other' in translation) {
                console.warn('i18n: Missing plural form ".'.concat(preferredForm, '" for "').concat(this.locale, '" locale. Falling back to ".other".'));
                return 'other';
            }
        }
        throw new Error('i18n: Plural form ".other" is required for "'.concat(this.locale, '" locale'));
    }
    selectPluralFormUsingFallbackRules(count) {
        count = Math.abs(Math.floor(count));
        const ruleset = this.getPluralRulesForLocale();
        if (ruleset) {
            return I18n.pluralRules[ruleset](count);
        }
        return 'other';
    }
    getPluralRulesForLocale() {
        const localeShort = this.locale.split('-')[0];
        for(const pluralRule in I18n.pluralRulesMap){
            const languages = I18n.pluralRulesMap[pluralRule];
            if (languages.includes(this.locale) || languages.includes(localeShort)) {
                return pluralRule;
            }
        }
    }
    constructor(translations = {}, config = {}){
        var _config$locale;
        this.translations = void 0;
        this.locale = void 0;
        this.translations = translations;
        this.locale = (_config$locale = config.locale) != null ? _config$locale : document.documentElement.lang || 'en';
    }
}
I18n.pluralRulesMap = {
    arabic: [
        'ar'
    ],
    chinese: [
        'my',
        'zh',
        'id',
        'ja',
        'jv',
        'ko',
        'ms',
        'th',
        'vi'
    ],
    french: [
        'hy',
        'bn',
        'fr',
        'gu',
        'hi',
        'fa',
        'pa',
        'zu'
    ],
    german: [
        'af',
        'sq',
        'az',
        'eu',
        'bg',
        'ca',
        'da',
        'nl',
        'en',
        'et',
        'fi',
        'ka',
        'de',
        'el',
        'hu',
        'lb',
        'no',
        'so',
        'sw',
        'sv',
        'ta',
        'te',
        'tr',
        'ur'
    ],
    irish: [
        'ga'
    ],
    russian: [
        'ru',
        'uk'
    ],
    scottish: [
        'gd'
    ],
    spanish: [
        'pt-PT',
        'it',
        'es'
    ],
    welsh: [
        'cy'
    ]
};
I18n.pluralRules = {
    arabic (n) {
        if (n === 0) {
            return 'zero';
        }
        if (n === 1) {
            return 'one';
        }
        if (n === 2) {
            return 'two';
        }
        if (n % 100 >= 3 && n % 100 <= 10) {
            return 'few';
        }
        if (n % 100 >= 11 && n % 100 <= 99) {
            return 'many';
        }
        return 'other';
    },
    chinese () {
        return 'other';
    },
    french (n) {
        return n === 0 || n === 1 ? 'one' : 'other';
    },
    german (n) {
        return n === 1 ? 'one' : 'other';
    },
    irish (n) {
        if (n === 1) {
            return 'one';
        }
        if (n === 2) {
            return 'two';
        }
        if (n >= 3 && n <= 6) {
            return 'few';
        }
        if (n >= 7 && n <= 10) {
            return 'many';
        }
        return 'other';
    },
    russian (n) {
        const lastTwo = n % 100;
        const last = lastTwo % 10;
        if (last === 1 && lastTwo !== 11) {
            return 'one';
        }
        if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
            return 'few';
        }
        if (last === 0 || last >= 5 && last <= 9 || lastTwo >= 11 && lastTwo <= 14) {
            return 'many';
        }
        return 'other';
    },
    scottish (n) {
        if (n === 1 || n === 11) {
            return 'one';
        }
        if (n === 2 || n === 12) {
            return 'two';
        }
        if (n >= 3 && n <= 10 || n >= 13 && n <= 19) {
            return 'few';
        }
        return 'other';
    },
    spanish (n) {
        if (n === 1) {
            return 'one';
        }
        if (n % 1000000 === 0 && n !== 0) {
            return 'many';
        }
        return 'other';
    },
    welsh (n) {
        if (n === 0) {
            return 'zero';
        }
        if (n === 1) {
            return 'one';
        }
        if (n === 2) {
            return 'two';
        }
        if (n === 3) {
            return 'few';
        }
        if (n === 6) {
            return 'many';
        }
        return 'other';
    }
};
;
 //# sourceMappingURL=i18n.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/accordion/accordion.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Accordion",
    ()=>Accordion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-dataset.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$i18n$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/i18n.mjs [app-client] (ecmascript)");
;
;
;
;
;
/**
 * Accordion component
 *
 * This allows a collection of sections to be collapsed by default, showing only
 * their headers. Sections can be expanded or collapsed individually by clicking
 * their headers. A "Show all sections" button is also added to the top of the
 * accordion, which switches to "Hide all sections" when all the sections are
 * expanded.
 *
 * The state of each section is saved to the DOM via the `aria-expanded`
 * attribute, which also provides accessibility.
 *
 * @preserve
 */ class Accordion extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    initControls() {
        this.$showAllButton = document.createElement('button');
        this.$showAllButton.setAttribute('type', 'button');
        this.$showAllButton.setAttribute('class', this.showAllClass);
        this.$showAllButton.setAttribute('aria-expanded', 'false');
        const $accordionControls = document.createElement('div');
        $accordionControls.setAttribute('class', this.controlsClass);
        $accordionControls.appendChild(this.$showAllButton);
        this.$module.insertBefore($accordionControls, this.$module.firstChild);
        this.$showAllText = document.createElement('span');
        if (this.showAllTextClass) {
            this.$showAllText.classList.add(this.showAllTextClass);
        }
        this.$showAllButton.appendChild(this.$showAllText);
        this.$showAllButton.addEventListener('click', ()=>this.onShowOrHideAllToggle());
        if ('onbeforematch' in document) {
            document.addEventListener('beforematch', (event)=>this.onBeforeMatch(event));
        }
    }
    initSectionHeaders() {
        this.$sections.forEach(($section, i)=>{
            const $header = $section.querySelector(".".concat(this.sectionHeaderClass));
            if (!$header) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                    componentName: 'Accordion',
                    identifier: 'Section headers (`<div class="'.concat(this.sectionHeaderClass, '">`)')
                });
            }
            this.constructHeaderMarkup($header, i);
            this.setExpanded(this.isExpanded($section), $section);
            $header.addEventListener('click', ()=>this.onSectionToggle($section));
            this.setInitialState($section);
        });
    }
    constructHeaderMarkup($header, index) {
        const $span = $header.querySelector(".".concat(this.sectionButtonClass));
        const $heading = $header.querySelector(".".concat(this.sectionHeadingClass));
        const $summary = $header.querySelector(".".concat(this.sectionSummaryClass));
        if (!$heading) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Accordion',
                identifier: "Section heading (`.".concat(this.sectionHeadingClass, "`)")
            });
        }
        if (!$span) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Accordion',
                identifier: 'Section button placeholder (`<span class="'.concat(this.sectionButtonClass, '">`)')
            });
        }
        const $button = document.createElement('button');
        $button.setAttribute('type', 'button');
        $button.setAttribute('aria-controls', "".concat(this.$module.id, "-content-").concat(index + 1));
        for (const attr of Array.from($span.attributes)){
            if (attr.nodeName !== 'id') {
                $button.setAttribute(attr.nodeName, "".concat(attr.nodeValue));
            }
        }
        const $headingText = document.createElement('span');
        $headingText.classList.add(this.sectionHeadingTextClass);
        $headingText.id = $span.id;
        const $headingTextFocus = document.createElement('span');
        $headingTextFocus.classList.add(this.sectionHeadingTextFocusClass);
        $headingText.appendChild($headingTextFocus);
        $headingTextFocus.innerHTML = $span.innerHTML;
        const $showHideToggle = document.createElement('span');
        $showHideToggle.classList.add(this.sectionShowHideToggleClass);
        $showHideToggle.setAttribute('data-nosnippet', '');
        const $showHideText = document.createElement('span');
        $showHideText.classList.add(this.sectionShowHideTextClass);
        $showHideToggle.appendChild($showHideText);
        $button.appendChild($headingText);
        $button.appendChild(this.getButtonPunctuationEl());
        if ($summary != null && $summary.parentNode) {
            const $summarySpan = document.createElement('span');
            const $summarySpanFocus = document.createElement('span');
            for (const attr of Array.from($summary.attributes)){
                $summarySpan.setAttribute(attr.nodeName, "".concat(attr.nodeValue));
            }
            $summarySpanFocus.innerHTML = $summary.innerHTML;
            $button.appendChild(this.getButtonPunctuationEl());
        }
        $button.appendChild($showHideToggle);
        $heading.removeChild($span);
        $heading.appendChild($button);
    }
    onBeforeMatch(event) {
        const $fragment = event.target;
        if (!($fragment instanceof Element)) {
            return;
        }
        const $section = $fragment.closest(".".concat(this.sectionClass));
        if ($section) {
            this.setExpanded(true, $section);
        }
    }
    onSectionToggle($section) {
        const expanded = this.isExpanded($section);
        this.setExpanded(!expanded, $section);
        const $button = $section.querySelector(".".concat(this.sectionButtonClass));
        if ($button instanceof HTMLButtonElement) {
            $button.focus();
        }
        this.storeState($section);
    }
    onShowOrHideAllToggle() {
        const nowExpanded = !this.checkIfAllSectionsOpen();
        this.$sections.forEach(($section)=>{
            this.setExpanded(nowExpanded, $section);
            this.storeState($section);
        });
        this.updateShowAllButton(nowExpanded);
    }
    setExpanded(expanded, $section) {
        const $showHideText = $section.querySelector(".".concat(this.sectionShowHideTextClass));
        const $button = $section.querySelector(".".concat(this.sectionButtonClass));
        const $content = $section.querySelector(".".concat(this.sectionContentClass));
        if (!$content) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Accordion',
                identifier: 'Section content (`<div class="'.concat(this.sectionContentClass, '">`)')
            });
        }
        if (!$showHideText || !$button) {
            return;
        }
        $showHideText.textContent = expanded ? 'remove' : 'add';
        $button.setAttribute('aria-expanded', "".concat(expanded));
        const ariaLabelParts = [];
        const $headingText = $section.querySelector(".".concat(this.sectionHeadingTextClass));
        if ($headingText) {
            ariaLabelParts.push("".concat($headingText.textContent).trim());
        }
        const $summary = $section.querySelector(".".concat(this.sectionSummaryClass));
        if ($summary) {
            ariaLabelParts.push("".concat($summary.textContent).trim());
        }
        const ariaLabelMessage = expanded ? this.i18n.t('hideSectionAriaLabel') : this.i18n.t('showSectionAriaLabel');
        ariaLabelParts.push(ariaLabelMessage);
        $button.setAttribute('aria-label', ariaLabelParts.join(' , '));
        if (expanded) {
            $content.removeAttribute('hidden');
            $section.classList.add(this.sectionExpandedClass);
        } else {
            $content.setAttribute('hidden', 'until-found');
            $section.classList.remove(this.sectionExpandedClass);
        }
        const areAllSectionsOpen = this.checkIfAllSectionsOpen();
        this.updateShowAllButton(areAllSectionsOpen);
    }
    isExpanded($section) {
        return $section.classList.contains(this.sectionExpandedClass);
    }
    checkIfAllSectionsOpen() {
        const sectionsCount = this.$sections.length;
        const expandedSectionCount = this.$module.querySelectorAll(".".concat(this.sectionExpandedClass)).length;
        return sectionsCount === expandedSectionCount;
    }
    updateShowAllButton(expanded) {
        if (!this.$showAllButton || !this.$showAllText) {
            return;
        }
        this.$showAllButton.setAttribute('aria-expanded', expanded.toString());
        this.$showAllText.textContent = expanded ? this.i18n.t('hideAllSections') : this.i18n.t('showAllSections');
    }
    storeState($section) {
        if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
            const $button = $section.querySelector(".".concat(this.sectionButtonClass));
            if ($button) {
                const contentId = $button.getAttribute('aria-controls');
                const contentState = $button.getAttribute('aria-expanded');
                if (contentId && contentState) {
                    window.sessionStorage.setItem(contentId, contentState);
                }
            }
        }
    }
    setInitialState($section) {
        if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
            const $button = $section.querySelector(".".concat(this.sectionButtonClass));
            if ($button) {
                const contentId = $button.getAttribute('aria-controls');
                const contentState = contentId ? window.sessionStorage.getItem(contentId) : null;
                if (contentState !== null) {
                    this.setExpanded(contentState === 'true', $section);
                }
            }
        }
    }
    getButtonPunctuationEl() {
        const $punctuationEl = document.createElement('span');
        $punctuationEl.classList.add('govuk-visually-hidden', this.sectionHeadingDividerClass);
        $punctuationEl.innerHTML = ', ';
        return $punctuationEl;
    }
    /**
   * @param {Element | null} $module - HTML element to use for accordion
   * @param {AccordionConfig} [config] - Accordion config
   */ constructor($module, config = {}){
        super();
        this.$module = void 0;
        this.config = void 0;
        this.i18n = void 0;
        this.controlsClass = 'govuk-accordion__controls';
        this.showAllClass = 'govuk-button govuk-button--texted';
        this.showAllTextClass = '';
        this.sectionClass = 'govuk-accordion__section';
        this.sectionExpandedClass = 'govuk-accordion__section--expanded';
        this.sectionButtonClass = 'govuk-accordion__section-button';
        this.sectionHeaderClass = 'govuk-accordion__section-header';
        this.sectionHeadingClass = 'govuk-accordion__section-heading';
        this.sectionHeadingDividerClass = 'govuk-accordion__section-heading-divider';
        this.sectionHeadingTextClass = 'govuk-accordion__section-heading-text';
        this.sectionHeadingTextFocusClass = 'govuk-accordion__section-heading-text-focus';
        this.sectionShowHideToggleClass = 'govuk-accordion__section-toggle';
        this.sectionShowHideTextClass = 'material-icons';
        this.sectionSummaryClass = 'govuk-accordion__section-summary';
        this.sectionContentClass = 'govuk-accordion__section-content';
        this.$sections = void 0;
        this.browserSupportsSessionStorage = false;
        this.$showAllButton = null;
        this.$showAllText = null;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Accordion',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        this.config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeConfigs"])(Accordion.defaults, config, (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseDataset"])(Accordion, $module.dataset));
        this.i18n = new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$i18n$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["I18n"](this.config.i18n);
        const $sections = this.$module.querySelectorAll(".".concat(this.sectionClass));
        if (!$sections.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Accordion',
                identifier: 'Sections (`<div class="'.concat(this.sectionClass, '">`)')
            });
        }
        this.$sections = $sections;
        this.browserSupportsSessionStorage = helper.checkForSessionStorage();
        this.initControls();
        this.initSectionHeaders();
        const areAllSectionsOpen = this.checkIfAllSectionsOpen();
        this.updateShowAllButton(areAllSectionsOpen);
    }
}
Accordion.moduleName = 'govuk-accordion';
Accordion.defaults = Object.freeze({
    i18n: {
        hideAllSections: 'Zatvoriť všetko',
        hideSectionAriaLabel: 'Zatvoriť túto sekciu',
        showAllSections: 'Otvoriť všetko',
        showSectionAriaLabel: 'Otvoriť túto sekciu'
    },
    rememberExpanded: true
});
Accordion.schema = Object.freeze({
    properties: {
        i18n: {
            type: 'object'
        },
        rememberExpanded: {
            type: 'boolean'
        }
    }
});
const helper = {
    /**
   * Check for `window.sessionStorage`, and that it actually works.
   *
   * @returns {boolean} True if session storage is available
   */ checkForSessionStorage: function() {
        const testString = 'this is the test string';
        let result;
        try {
            window.sessionStorage.setItem(testString, testString);
            result = window.sessionStorage.getItem(testString) === testString.toString();
            window.sessionStorage.removeItem(testString);
            return result;
        } catch (exception) {
            return false;
        }
    }
};
;
 //# sourceMappingURL=accordion.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/button/button.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-dataset.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
;
;
const DEBOUNCE_TIMEOUT_IN_SECONDS = 1;
/**
 * JavaScript enhancements for the Button component
 *
 * @preserve
 */ class Button extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    handleKeyDown(event) {
        const $target = event.target;
        if (event.key !== ' ') {
            return;
        }
        if ($target instanceof HTMLElement && $target.getAttribute('role') === 'button') {
            event.preventDefault();
            $target.click();
        }
    }
    debounce(event) {
        if (!this.config.preventDoubleClick) {
            return;
        }
        if (this.debounceFormSubmitTimer) {
            event.preventDefault();
            return false;
        }
        this.debounceFormSubmitTimer = window.setTimeout(()=>{
            this.debounceFormSubmitTimer = null;
        }, DEBOUNCE_TIMEOUT_IN_SECONDS * 1000);
    }
    /**
   * @param {Element | null} $module - HTML element to use for button
   * @param {ButtonConfig} [config] - Button config
   */ constructor($module, config = {}){
        super();
        this.$module = void 0;
        this.config = void 0;
        this.debounceFormSubmitTimer = null;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Button',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        this.config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeConfigs"])(Button.defaults, config, (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseDataset"])(Button, $module.dataset));
        this.$module.addEventListener('keydown', (event)=>this.handleKeyDown(event));
        this.$module.addEventListener('click', (event)=>this.debounce(event));
    }
}
/**
 * Button config
 *
 * @typedef {object} ButtonConfig
 * @property {boolean} [preventDoubleClick=false] - Prevent accidental double
 *   clicks on submit buttons from submitting forms multiple times.
 */ /**
 * @typedef {import('../../common/index.mjs').Schema} Schema
 */ Button.moduleName = 'govuk-button';
Button.defaults = Object.freeze({
    preventDoubleClick: false
});
Button.schema = Object.freeze({
    properties: {
        preventDoubleClick: {
            type: 'boolean'
        }
    }
});
;
 //# sourceMappingURL=button.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/checkboxes/checkboxes.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Checkboxes",
    ()=>Checkboxes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
/**
 * Checkboxes component
 *
 * @preserve
 */ class Checkboxes extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    syncAllConditionalReveals() {
        this.$inputs.forEach(($input)=>this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
        const targetId = $input.getAttribute('aria-controls');
        if (!targetId) {
            return;
        }
        const $target = document.getElementById(targetId);
        if ($target && $target.classList.contains('govuk-checkboxes__conditional')) {
            const inputIsChecked = $input.checked;
            $input.setAttribute('aria-expanded', inputIsChecked.toString());
            $target.classList.toggle('govuk-checkboxes__conditional--hidden', !inputIsChecked);
        }
    }
    unCheckAllInputsExcept($input) {
        const allInputsWithSameName = document.querySelectorAll('input[type="checkbox"][name="'.concat($input.name, '"]'));
        allInputsWithSameName.forEach(($inputWithSameName)=>{
            const hasSameFormOwner = $input.form === $inputWithSameName.form;
            if (hasSameFormOwner && $inputWithSameName !== $input) {
                $inputWithSameName.checked = false;
                this.syncConditionalRevealWithInputState($inputWithSameName);
            }
        });
    }
    unCheckExclusiveInputs($input) {
        const allInputsWithSameNameAndExclusiveBehaviour = document.querySelectorAll('input[data-behaviour="exclusive"][type="checkbox"][name="'.concat($input.name, '"]'));
        allInputsWithSameNameAndExclusiveBehaviour.forEach(($exclusiveInput)=>{
            const hasSameFormOwner = $input.form === $exclusiveInput.form;
            if (hasSameFormOwner) {
                $exclusiveInput.checked = false;
                this.syncConditionalRevealWithInputState($exclusiveInput);
            }
        });
    }
    handleClick(event) {
        const $clickedInput = event.target;
        if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'checkbox') {
            return;
        }
        const hasAriaControls = $clickedInput.getAttribute('aria-controls');
        if (hasAriaControls) {
            this.syncConditionalRevealWithInputState($clickedInput);
        }
        if (!$clickedInput.checked) {
            return;
        }
        const hasBehaviourExclusive = $clickedInput.getAttribute('data-behaviour') === 'exclusive';
        if (hasBehaviourExclusive) {
            this.unCheckAllInputsExcept($clickedInput);
        } else {
            this.unCheckExclusiveInputs($clickedInput);
        }
    }
    /**
   * Checkboxes can be associated with a 'conditionally revealed' content block
   * – for example, a checkbox for 'Phone' could reveal an additional form field
   * for the user to enter their phone number.
   *
   * These associations are made using a `data-aria-controls` attribute, which
   * is promoted to an aria-controls attribute during initialisation.
   *
   * We also need to restore the state of any conditional reveals on the page
   * (for example if the user has navigated back), and set up event handlers to
   * keep the reveal in sync with the checkbox state.
   *
   * @param {Element | null} $module - HTML element to use for checkboxes
   */ constructor($module){
        super();
        this.$module = void 0;
        this.$inputs = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Checkboxes',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        const $inputs = $module.querySelectorAll('input[type="checkbox"]');
        if (!$inputs.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Checkboxes',
                identifier: 'Form inputs (`<input type="checkbox">`)'
            });
        }
        this.$module = $module;
        this.$inputs = $inputs;
        this.$inputs.forEach(($input)=>{
            const targetId = $input.getAttribute('data-aria-controls');
            if (!targetId) {
                return;
            }
            if (!document.getElementById(targetId)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                    componentName: 'Checkboxes',
                    identifier: 'Conditional reveal (`id="'.concat(targetId, '"`)')
                });
            }
            $input.setAttribute('aria-controls', targetId);
            $input.removeAttribute('data-aria-controls');
        });
        window.addEventListener('pageshow', ()=>this.syncAllConditionalReveals());
        this.syncAllConditionalReveals();
        this.$module.addEventListener('click', (event)=>this.handleClick(event));
    }
}
Checkboxes.moduleName = 'govuk-checkboxes';
;
 //# sourceMappingURL=checkboxes.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/error-summary/error-summary.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorSummary",
    ()=>ErrorSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-dataset.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
;
;
/**
 * Error summary component
 *
 * Takes focus on initialisation for accessible announcement, unless disabled in
 * configuration.
 *
 * @preserve
 */ class ErrorSummary extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    handleClick(event) {
        const $target = event.target;
        if ($target && this.focusTarget($target)) {
            event.preventDefault();
        }
    }
    focusTarget($target) {
        if (!($target instanceof HTMLAnchorElement)) {
            return false;
        }
        const inputId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFragmentFromUrl"])($target.href);
        if (!inputId) {
            return false;
        }
        const $input = document.getElementById(inputId);
        if (!$input) {
            return false;
        }
        const $legendOrLabel = this.getAssociatedLegendOrLabel($input);
        if (!$legendOrLabel) {
            return false;
        }
        $legendOrLabel.scrollIntoView();
        $input.focus({
            preventScroll: true
        });
        return true;
    }
    getAssociatedLegendOrLabel($input) {
        var _document$querySelect;
        const $fieldset = $input.closest('fieldset');
        if ($fieldset) {
            const $legends = $fieldset.getElementsByTagName('legend');
            if ($legends.length) {
                const $candidateLegend = $legends[0];
                if ($input instanceof HTMLInputElement && ($input.type === 'checkbox' || $input.type === 'radio')) {
                    return $candidateLegend;
                }
                const legendTop = $candidateLegend.getBoundingClientRect().top;
                const inputRect = $input.getBoundingClientRect();
                if (inputRect.height && window.innerHeight) {
                    const inputBottom = inputRect.top + inputRect.height;
                    if (inputBottom - legendTop < window.innerHeight / 2) {
                        return $candidateLegend;
                    }
                }
            }
        }
        return (_document$querySelect = document.querySelector("label[for='".concat($input.getAttribute('id'), "']"))) != null ? _document$querySelect : $input.closest('label');
    }
    /**
   * @param {Element | null} $module - HTML element to use for error summary
   * @param {ErrorSummaryConfig} [config] - Error summary config
   */ constructor($module, config = {}){
        super();
        this.$module = void 0;
        this.config = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Error summary',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        this.config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeConfigs"])(ErrorSummary.defaults, config, (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseDataset"])(ErrorSummary, $module.dataset));
        if (!this.config.disableAutoFocus) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setFocus"])(this.$module);
        }
        this.$module.addEventListener('click', (event)=>this.handleClick(event));
    }
}
/**
 * Error summary config
 *
 * @typedef {object} ErrorSummaryConfig
 * @property {boolean} [disableAutoFocus=false] - If set to `true` the error
 *   summary will not be focussed when the page loads.
 */ /**
 * @typedef {import('../../common/index.mjs').Schema} Schema
 */ ErrorSummary.moduleName = 'govuk-error-summary';
ErrorSummary.defaults = Object.freeze({
    disableAutoFocus: false
});
ErrorSummary.schema = Object.freeze({
    properties: {
        disableAutoFocus: {
            type: 'boolean'
        }
    }
});
;
 //# sourceMappingURL=error-summary.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/file-upload/file-upload.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileUpload",
    ()=>FileUpload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
class FileUpload extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    initEventListeners() {
        var _this$$fileInput2;
        if (this.$uploadButton) {
            this.$uploadButton.addEventListener('click', ()=>{
                var _this$$fileInput;
                return (_this$$fileInput = this.$fileInput) == null ? void 0 : _this$$fileInput.click();
            });
        }
        (_this$$fileInput2 = this.$fileInput) == null || _this$$fileInput2.addEventListener('change', ()=>{
            var _this$$fileInput3;
            return this.handleFiles((_this$$fileInput3 = this.$fileInput) == null ? void 0 : _this$$fileInput3.files);
        });
        if (this.$uploadContainer) {
            this.$uploadContainer.addEventListener('dragenter', (e)=>this.onDragEnter(e));
            this.$uploadContainer.addEventListener('dragover', (e)=>this.onDragOver(e));
            this.$uploadContainer.addEventListener('dragleave', (e)=>this.onDragLeave(e));
            this.$uploadContainer.addEventListener('drop', (e)=>this.onDrop(e));
        }
    }
    /**
   * Handles the dragenter event.
   *
   * @param {DragEvent} event - The dragenter event.
   */ onDragEnter(event) {
        var _this$$uploadContaine;
        event.preventDefault();
        event.stopPropagation();
        (_this$$uploadContaine = this.$uploadContainer) == null || _this$$uploadContaine.classList.add('dragover');
    }
    /**
   * Handles the dragover event.
   *
   * @param {DragEvent} event - The dragover event.
   */ onDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    /**
   * Handles the dragleave event.
   *
   * @param {DragEvent} event - The dragleave event.
   */ onDragLeave(event) {
        var _this$$uploadContaine2;
        event.preventDefault();
        event.stopPropagation();
        (_this$$uploadContaine2 = this.$uploadContainer) == null || _this$$uploadContaine2.classList.remove('dragover');
    }
    /**
   * Handles the drop event.
   *
   * @param {DragEvent} event - The drop event.
   */ onDrop(event) {
        var _this$$uploadContaine3, _event$dataTransfer;
        event.preventDefault();
        event.stopPropagation();
        (_this$$uploadContaine3 = this.$uploadContainer) == null || _this$$uploadContaine3.classList.remove('dragover');
        const files = (_event$dataTransfer = event.dataTransfer) == null ? void 0 : _event$dataTransfer.files;
        this.handleFiles(files);
    }
    /**
   * Handles the selected or dropped files.
   *
   * @param {FileList | null | undefined} files - The list of files to handle.
   */ handleFiles(files) {
        if (files && files.length > 0) {
            alert("Selected file: ".concat(files[0].name));
        }
    }
    /**
   * Creates an instance of FileUploader.
   *
   * @param {Element | null} $module - HTML element to be used for error summary.
   */ constructor($module){
        super();
        this.$module = void 0;
        this.$uploadContainer = void 0;
        this.$fileInput = void 0;
        this.$uploadButton = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'File-upload',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        const uploadContainer = $module.querySelector('.upload-box');
        if (uploadContainer instanceof HTMLElement) {
            this.$uploadContainer = uploadContainer;
        }
        const fileInput = $module.querySelector('input[data-file-input]');
        if (fileInput instanceof HTMLInputElement) {
            this.$fileInput = fileInput;
        }
        const uploadButton = $module.querySelector('.upload-button');
        if (uploadButton instanceof HTMLButtonElement) {
            this.$uploadButton = uploadButton;
        }
        this.initEventListeners();
    }
}
/**
 * File upload config
 *
 * @typedef {object} FileUploadConfig
 * @property {boolean} [disableAutoFocus=false] - If set to `true` the error
 *   summary will not be focussed when the page loads.
 */ /**
 * @typedef {import('../../common/index.mjs').Schema} Schema
 */ FileUpload.moduleName = 'govuk-fileUpload';
;
 //# sourceMappingURL=file-upload.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/header/header.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
;
/**
 * Header component
 *
 * @preserve
 */ class Header extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    setupResponsiveChecks() {
        const breakpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBreakpoint"])('desktop');
        if (!breakpoint.value) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Header',
                identifier: "CSS custom property (`".concat(breakpoint.property, "`) on pseudo-class `:root`")
            });
        }
        this.mql = window.matchMedia("(min-width: ".concat(breakpoint.value, ")"));
        if ('addEventListener' in this.mql) {
            this.mql.addEventListener('change', ()=>this.checkMode());
        } else {
            this.mql.addListener(()=>this.checkMode());
        }
        this.checkMode();
    }
    checkMode() {
        if (this.mql == null || !this.$header) {
            return;
        }
        if (this.mql.matches) {
            var _this$$menu, _this$$menuButton, _this$$header$querySe, _this$$header$querySe2;
            (_this$$menu = this.$menu) == null || _this$$menu.removeAttribute('hidden');
            (_this$$menuButton = this.$menuButton) == null || _this$$menuButton.setAttribute('hidden', '');
            (_this$$header$querySe = this.$header.querySelector('.govuk-header__link--homepage')) == null || _this$$header$querySe.removeAttribute('hidden');
            (_this$$header$querySe2 = this.$header.querySelector('.idsk-searchbar__wrapper')) == null || _this$$header$querySe2.classList.remove('hide');
        } else {
            var _this$$menuButton2, _this$$menuButton3, _this$$menu2;
            if (this.$profileDialog) {
                this.$profileDialog.close();
            }
            (_this$$menuButton2 = this.$menuButton) == null || _this$$menuButton2.removeAttribute('hidden');
            (_this$$menuButton3 = this.$menuButton) == null || _this$$menuButton3.setAttribute('aria-expanded', this.menuIsOpen.toString());
            (_this$$menu2 = this.$menu) == null || _this$$menu2.removeAttribute('hidden');
            if (this.$menuButton) {
                this.$menuButton.textContent = this.menuIsOpen ? 'Zavrieť' : 'Menu';
                this.createMaterialIcon(this.menuIsOpen ? 'close' : 'menu', this.$menuButton);
            }
            if (this.menuIsOpen) {
                var _this$$menu3, _this$$header$querySe3, _this$$header$querySe4, _this$$header$querySe5;
                (_this$$menu3 = this.$menu) == null || _this$$menu3.removeAttribute('hidden');
                (_this$$header$querySe3 = this.$header.querySelector('.govuk-header__actionPanel.mobile')) == null || _this$$header$querySe3.classList.remove('mobile-hidden');
                (_this$$header$querySe4 = this.$header.querySelector('.govuk-header__link--homepage')) == null || _this$$header$querySe4.setAttribute('hidden', '');
                console.log(this.$header.querySelector('.idsk-searchbar__wrapper'));
                (_this$$header$querySe5 = this.$header.querySelector('.idsk-searchbar__wrapper')) == null || _this$$header$querySe5.classList.remove('hide');
            } else {
                var _this$$menu4, _this$$header$querySe6, _this$$header$querySe7, _this$$header$querySe8;
                (_this$$menu4 = this.$menu) == null || _this$$menu4.setAttribute('hidden', '');
                (_this$$header$querySe6 = this.$header.querySelector('.govuk-header__actionPanel.mobile')) == null || _this$$header$querySe6.classList.add('mobile-hidden');
                (_this$$header$querySe7 = this.$header.querySelector('.govuk-header__link--homepage')) == null || _this$$header$querySe7.removeAttribute('hidden');
                (_this$$header$querySe8 = this.$header.querySelector('.idsk-searchbar__wrapper')) == null || _this$$header$querySe8.classList.add('hide');
            }
        }
    }
    handleMenuButtonClick() {
        this.menuIsOpen = !this.menuIsOpen;
        this.checkMode();
    }
    openCloseDropdownMenu() {
        if (!this.$dropdownToggle) {
            return;
        }
        this.$dropdownToggle.addEventListener('click', (event)=>{
            if (this.$dropdownToggle) {
                event.preventDefault();
                this.$dropdownToggle.classList.toggle('open');
            }
        });
        this.clickOutsideClose(this.$dropdownToggle, 'open');
    }
    /**
   * Create and add material icon to parent element
   *
   * @param {string} iconName - icon name for create
   * @param {HTMLElement} parentElem - element to which the icon will be added
   */ createMaterialIcon(iconName, parentElem) {
        const spanIcon = document.createElement('span');
        spanIcon.className = 'material-icons';
        spanIcon.textContent = iconName.toString();
        spanIcon.ariaHidden = 'true';
        parentElem.appendChild(spanIcon);
    }
    /**
   * Function for click outside and close some elem
   *
   * @param {HTMLElement} openedElem - element which need to remove open className
   * @param {string} className - name of className to remove and close some opened element
   */ clickOutsideClose(openedElem, className) {
        document.addEventListener('click', (event)=>{
            if (event.target instanceof Node && !openedElem.contains(event.target)) {
                openedElem.classList.remove(className.toString());
            }
        });
    }
    /**
   * Apply a matchMedia for desktop which will trigger a state sync if the
   * browser viewport moves between states.
   *
   * @param {Element | null} $module - HTML element to use for header
   */ constructor($module){
        super();
        this.$module = void 0;
        this.$menuButton = void 0;
        this.$menu = void 0;
        this.$dropdownToggle = void 0;
        this.$header = void 0;
        this.$profileDialog = void 0;
        this.menuIsOpen = false;
        this.mql = null;
        if (!$module) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Header',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        const dropdownItems = $module.querySelectorAll('.idsk-dropdown__wrapper');
        dropdownItems.forEach((dropdownItem)=>new Dropdown(dropdownItem));
        this.$module = $module;
        const $menuButton = $module.querySelector('.govuk-js-header-toggle');
        const header = document.querySelector('.govuk-header');
        if (header instanceof HTMLElement) {
            this.$header = header;
        }
        if (!$menuButton) {
            return this;
        }
        const menuId = $menuButton.getAttribute('aria-controls');
        if (!menuId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Header',
                identifier: 'Navigation button (`<button class="govuk-js-header-toggle">`) attribute (`aria-controls`)'
            });
        }
        const websitesNavBody = $module.querySelector('.idsk-secondary-navigation__body');
        const websitesNavBtn = $module.querySelector('.idsk-secondary-navigation__heading-button');
        if (websitesNavBody instanceof HTMLElement && websitesNavBtn instanceof HTMLElement) {
            websitesNavBtn.addEventListener('click', (event)=>{
                var _websitesNavBtn$query;
                event.preventDefault();
                const menuIsOpen = !(websitesNavBtn.ariaExpanded === 'true');
                const iconClassList = (_websitesNavBtn$query = websitesNavBtn.querySelector('.material-icons')) == null ? void 0 : _websitesNavBtn$query.classList;
                if (menuIsOpen) {
                    websitesNavBody.classList.remove('hidden');
                    iconClassList == null || iconClassList.add('rotate180');
                    websitesNavBtn.ariaExpanded = 'true';
                } else {
                    websitesNavBody.classList.add('hidden');
                    iconClassList == null || iconClassList.remove('rotate180');
                    websitesNavBtn.ariaExpanded = 'false';
                }
            });
        }
        const menu = document.querySelector("#".concat(menuId));
        if (menu instanceof HTMLElement) {
            this.$menu = menu;
        }
        if ($menuButton instanceof HTMLElement) {
            this.$menuButton = $menuButton;
            this.$menuButton.addEventListener('click', ()=>{
                this.handleMenuButtonClick();
            });
        }
        this.setupResponsiveChecks();
        const dropdownToggle = $module.querySelector('.dropdown-toggle');
        if (dropdownToggle instanceof HTMLElement) {
            this.$dropdownToggle = dropdownToggle;
            this.openCloseDropdownMenu();
        }
        const profileDialog = document.getElementById('navigationProfileDialog');
        if (profileDialog instanceof HTMLDialogElement) {
            this.$profileDialog = profileDialog;
        }
        const profileButton = $module.querySelector('.govuk-header__profile_button');
        const profileCloseButton = $module.querySelector('.govuk-header__profile_close_button');
        if (profileDialog instanceof HTMLDialogElement && this.$profileDialog) {
            profileButton == null || profileButton.addEventListener('click', ()=>{
                if (profileDialog.open) {
                    var _this$$profileDialog;
                    (_this$$profileDialog = this.$profileDialog) == null || _this$$profileDialog.close();
                } else {
                    var _this$$profileDialog2;
                    (_this$$profileDialog2 = this.$profileDialog) == null || _this$$profileDialog2.showModal();
                }
            });
            profileCloseButton == null || profileCloseButton.addEventListener('click', ()=>profileDialog.close());
            profileDialog.addEventListener('click', (event)=>{
                if (event.target === this.$profileDialog) {
                    this.$profileDialog.close();
                }
            });
        }
    }
}
/**
 * JavaScript enhancements for the Dropdown component
 *
 * @preserve
 */ Header.moduleName = 'govuk-header';
class Dropdown {
    handleClick(event) {
        var _this$$module$dataset;
        if (!this.button) {
            return;
        }
        event.preventDefault();
        this.isOpen = !this.isOpen;
        const label = (_this$$module$dataset = this.$module.dataset.pseudolabel) != null ? _this$$module$dataset : '';
        if (this.isOpen) {
            var _this$button$querySel, _this$options;
            this.$module.classList.add('open');
            (_this$button$querySel = this.button.querySelector('svg')) == null || _this$button$querySel.classList.add('idsk-dropdown__icon--opened');
            this.button.ariaLabel = "Zavrieť ".concat(label);
            (_this$options = this.options) == null || _this$options.classList.add('idsk-dropdown--opened');
        } else {
            var _this$button$querySel2, _this$options2;
            this.$module.classList.remove('open');
            (_this$button$querySel2 = this.button.querySelector('svg')) == null || _this$button$querySel2.classList.remove('idsk-dropdown__icon--opened');
            this.button.ariaLabel = "Rozbaliť ".concat(label);
            (_this$options2 = this.options) == null || _this$options2.classList.remove('idsk-dropdown--opened');
        }
        this.button.ariaExpanded = this.isOpen.toString();
    }
    /**
   * @param {Element | null} $module - HTML element to use for dropdown
   */ constructor($module){
        var _this$button;
        this.$module = void 0;
        this.button = void 0;
        this.options = void 0;
        this.isOpen = false;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Dropdown',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        const buttonElement = this.$module.querySelector('.idsk-dropdown');
        const optionsElement = this.$module.querySelector('.idsk-dropdown__options');
        this.button = buttonElement;
        this.options = optionsElement;
        if (!buttonElement) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Dropdown button',
                element: buttonElement,
                identifier: 'Button dropdown trigger'
            });
        }
        if (!optionsElement) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Dropdown options',
                element: optionsElement,
                identifier: 'Dropdown options block'
            });
        }
        (_this$button = this.button) == null || _this$button.addEventListener('click', (event)=>this.handleClick(event));
        document.addEventListener('click', (event)=>{
            if (event.target instanceof Node && !this.$module.contains(event.target) && this.isOpen) {
                this.handleClick(event);
            }
        });
    }
}
;
 //# sourceMappingURL=header.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/notification-banner/notification-banner.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationBanner",
    ()=>NotificationBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/normalise-dataset.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
;
;
/**
 * Notification Banner component
 *
 * @preserve
 */ class NotificationBanner extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    /**
   * @param {Element | null} $module - HTML element to use for notification banner
   * @param {NotificationBannerConfig} [config] - Notification banner config
   */ constructor($module, config = {}){
        super();
        this.$module = void 0;
        this.config = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Notification banner',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        this.config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergeConfigs"])(NotificationBanner.defaults, config, (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$normalise$2d$dataset$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normaliseDataset"])(NotificationBanner, $module.dataset));
        if (this.$module.getAttribute('role') === 'alert' && !this.config.disableAutoFocus) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setFocus"])(this.$module);
        }
    }
}
/**
 * Notification banner config
 *
 * @typedef {object} NotificationBannerConfig
 * @property {boolean} [disableAutoFocus=false] - If set to `true` the
 *   notification banner will not be focussed when the page loads. This only
 *   applies if the component has a `role` of `alert` – in other cases the
 *   component will not be focused on page load, regardless of this option.
 */ /**
 * @typedef {import('../../common/index.mjs').Schema} Schema
 */ NotificationBanner.moduleName = 'govuk-notification-banner';
NotificationBanner.defaults = Object.freeze({
    disableAutoFocus: false
});
NotificationBanner.schema = Object.freeze({
    properties: {
        disableAutoFocus: {
            type: 'boolean'
        }
    }
});
;
 //# sourceMappingURL=notification-banner.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/radios/radios.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Radios",
    ()=>Radios
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
/**
 * Radios component
 *
 * @preserve
 */ class Radios extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    syncAllConditionalReveals() {
        this.$inputs.forEach(($input)=>this.syncConditionalRevealWithInputState($input));
    }
    syncConditionalRevealWithInputState($input) {
        const targetId = $input.getAttribute('aria-controls');
        if (!targetId) {
            return;
        }
        const $target = document.getElementById(targetId);
        if ($target != null && $target.classList.contains('govuk-radios__conditional')) {
            const inputIsChecked = $input.checked;
            $input.setAttribute('aria-expanded', inputIsChecked.toString());
            $target.classList.toggle('govuk-radios__conditional--hidden', !inputIsChecked);
        }
    }
    handleClick(event) {
        const $clickedInput = event.target;
        if (!($clickedInput instanceof HTMLInputElement) || $clickedInput.type !== 'radio') {
            return;
        }
        const $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');
        const $clickedInputForm = $clickedInput.form;
        const $clickedInputName = $clickedInput.name;
        $allInputs.forEach(($input)=>{
            const hasSameFormOwner = $input.form === $clickedInputForm;
            const hasSameName = $input.name === $clickedInputName;
            if (hasSameName && hasSameFormOwner) {
                this.syncConditionalRevealWithInputState($input);
            }
        });
    }
    /**
   * Radios can be associated with a 'conditionally revealed' content block –
   * for example, a radio for 'Phone' could reveal an additional form field for
   * the user to enter their phone number.
   *
   * These associations are made using a `data-aria-controls` attribute, which
   * is promoted to an aria-controls attribute during initialisation.
   *
   * We also need to restore the state of any conditional reveals on the page
   * (for example if the user has navigated back), and set up event handlers to
   * keep the reveal in sync with the radio state.
   *
   * @param {Element | null} $module - HTML element to use for radios
   */ constructor($module){
        super();
        this.$module = void 0;
        this.$inputs = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Radios',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        const $inputs = $module.querySelectorAll('input[type="radio"]');
        if (!$inputs.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Radios',
                identifier: 'Form inputs (`<input type="radio">`)'
            });
        }
        this.$module = $module;
        this.$inputs = $inputs;
        this.$inputs.forEach(($input)=>{
            const targetId = $input.getAttribute('data-aria-controls');
            if (!targetId) {
                return;
            }
            if (!document.getElementById(targetId)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                    componentName: 'Radios',
                    identifier: 'Conditional reveal (`id="'.concat(targetId, '"`)')
                });
            }
            $input.setAttribute('aria-controls', targetId);
            $input.removeAttribute('data-aria-controls');
        });
        window.addEventListener('pageshow', ()=>this.syncAllConditionalReveals());
        this.syncAllConditionalReveals();
        this.$module.addEventListener('click', (event)=>this.handleClick(event));
    }
}
Radios.moduleName = 'govuk-radios';
;
 //# sourceMappingURL=radios.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/textarea/textarea.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/govuk-frontend-component.mjs [app-client] (ecmascript)");
;
;
/**
 * Textarea component
 *
 * @preserve
 */ class Textarea extends __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$govuk$2d$frontend$2d$component$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOVUKFrontendComponent"] {
    handleChange(event) {
        const el = event.target;
        if (el instanceof HTMLTextAreaElement) {
            this.counter.textContent = el.value.length.toString();
        }
    }
    /**
   * @param {Element | null} $module - HTML element to use for textarea
   */ constructor($module){
        super();
        this.$module = void 0;
        this.counter = void 0;
        this.textarea = void 0;
        if (!($module instanceof HTMLElement)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Textarea',
                element: $module,
                identifier: 'Root element (`$module`)'
            });
        }
        this.$module = $module;
        const textarea = this.$module.querySelector('textarea');
        const counterElement = this.$module.querySelector('.idsk-textarea--counter span');
        if (!textarea) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Textarea input',
                element: textarea,
                identifier: 'Textarea input element'
            });
        }
        if (!counterElement) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ElementError"]({
                componentName: 'Textarea counter',
                element: counterElement,
                identifier: 'Textarea length counter'
            });
        }
        this.textarea = textarea;
        this.counter = counterElement;
        this.counter.textContent = this.textarea.value.length.toString();
        this.textarea.addEventListener('input', (event)=>this.handleChange(event));
    }
}
Textarea.moduleName = 'govuk-textarea';
;
 //# sourceMappingURL=textarea.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/all.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initAll",
    ()=>initAll
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$govuk$2d$frontend$2d$version$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/govuk-frontend-version.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$accordion$2f$accordion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/accordion/accordion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$button$2f$button$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/button/button.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$checkboxes$2f$checkboxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/checkboxes/checkboxes.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$error$2d$summary$2f$error$2d$summary$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/error-summary/error-summary.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$file$2d$upload$2f$file$2d$upload$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/file-upload/file-upload.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$header$2f$header$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/header/header.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$notification$2d$banner$2f$notification$2d$banner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/notification-banner/notification-banner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$radios$2f$radios$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/radios/radios.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$textarea$2f$textarea$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/textarea/textarea.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/errors/index.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * Initialise all components
 *
 * Use the `data-module` attributes to find, instantiate and init all of the
 * components provided as part of GOV.UK Frontend.
 *
 * @param {Config & { scope?: Element }} [config] - Config for all components (with optional scope)
 */ function initAll(config) {
    var _config$scope;
    config = typeof config !== 'undefined' ? config : {};
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupported"])()) {
        console.log(new __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$errors$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SupportError"]());
        return;
    }
    const components = [
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$accordion$2f$accordion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Accordion"],
            config.accordion
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$button$2f$button$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"],
            config.button
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$checkboxes$2f$checkboxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Checkboxes"]
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$error$2d$summary$2f$error$2d$summary$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorSummary"],
            config.errorSummary
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$header$2f$header$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"]
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$notification$2d$banner$2f$notification$2d$banner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NotificationBanner"],
            config.notificationBanner
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$radios$2f$radios$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Radios"]
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$file$2d$upload$2f$file$2d$upload$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"]
        ],
        [
            __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$textarea$2f$textarea$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"]
        ]
    ];
    const $scope = (_config$scope = config.scope) != null ? _config$scope : document;
    components.forEach((param)=>{
        let [Component, config] = param;
        const $elements = $scope.querySelectorAll('[data-module="'.concat(Component.moduleName, '"]'));
        $elements.forEach(($element)=>{
            try {
                'defaults' in Component ? new Component($element, config) : new Component($element);
            } catch (error) {
                console.log(error);
            }
        });
    });
}
;
 //# sourceMappingURL=all.mjs.map
}),
"[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/all.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Accordion",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$accordion$2f$accordion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Accordion"],
    "Button",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$button$2f$button$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"],
    "Checkboxes",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$checkboxes$2f$checkboxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Checkboxes"],
    "ErrorSummary",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$error$2d$summary$2f$error$2d$summary$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorSummary"],
    "FileUpload",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$file$2d$upload$2f$file$2d$upload$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"],
    "Header",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$header$2f$header$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"],
    "NotificationBanner",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$notification$2d$banner$2f$notification$2d$banner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NotificationBanner"],
    "Radios",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$radios$2f$radios$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Radios"],
    "Textarea",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$textarea$2f$textarea$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"],
    "initAll",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$all$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initAll"],
    "version",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$govuk$2d$frontend$2d$version$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$all$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/all.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$common$2f$govuk$2d$frontend$2d$version$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/common/govuk-frontend-version.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$accordion$2f$accordion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/accordion/accordion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$button$2f$button$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/button/button.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$checkboxes$2f$checkboxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/checkboxes/checkboxes.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$error$2d$summary$2f$error$2d$summary$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/error-summary/error-summary.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$file$2d$upload$2f$file$2d$upload$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/file-upload/file-upload.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$header$2f$header$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/header/header.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$notification$2d$banner$2f$notification$2d$banner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/notification-banner/notification-banner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$radios$2f$radios$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/radios/radios.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$edu$2d$kinder$2f$node_modules$2f40$id$2d$sk$2f$frontend$2f$dist$2f$govuk$2f$components$2f$textarea$2f$textarea$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/edu-kinder/node_modules/@id-sk/frontend/dist/govuk/components/textarea/textarea.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=c2704_%40id-sk_frontend_dist_govuk_43109084._.js.map