import { NAMESPACES } from "./config.js";
import { createTranslator, namespace } from "./helpers.js";

import enCommon from "./namespaces/en/common.js";
import enEntry from "./namespaces/en/entry.js";
import enAccount from "./namespaces/en/account.js";
import enLanding from "./namespaces/en/landing.js";
import enBuilder from "./namespaces/en/builder.js";
import enCover from "./namespaces/en/cover.js";
import enAts from "./namespaces/en/ats.js";
import enTracker from "./namespaces/en/tracker.js";
import enMaster from "./namespaces/en/master.js";
import enStatus from "./namespaces/en/status.js";
import enModal from "./namespaces/en/modal.js";
import enLanding2 from "./namespaces/en/landing2.js";
import enFooter from "./namespaces/en/footer.js";

import frCommon from "./namespaces/fr/common.js";
import frEntry from "./namespaces/fr/entry.js";
import frAccount from "./namespaces/fr/account.js";
import frLanding from "./namespaces/fr/landing.js";
import frBuilder from "./namespaces/fr/builder.js";
import frCover from "./namespaces/fr/cover.js";
import frAts from "./namespaces/fr/ats.js";
import frTracker from "./namespaces/fr/tracker.js";
import frMaster from "./namespaces/fr/master.js";
import frStatus from "./namespaces/fr/status.js";
import frModal from "./namespaces/fr/modal.js";
import frLanding2 from "./namespaces/fr/landing2.js";
import frFooter from "./namespaces/fr/footer.js";

import arCommon from "./namespaces/ar/common.js";
import arEntry from "./namespaces/ar/entry.js";
import arAccount from "./namespaces/ar/account.js";
import arLanding from "./namespaces/ar/landing.js";
import arBuilder from "./namespaces/ar/builder.js";
import arCover from "./namespaces/ar/cover.js";
import arAts from "./namespaces/ar/ats.js";
import arTracker from "./namespaces/ar/tracker.js";
import arMaster from "./namespaces/ar/master.js";
import arStatus from "./namespaces/ar/status.js";
import arModal from "./namespaces/ar/modal.js";
import arLanding2 from "./namespaces/ar/landing2.js";
import arFooter from "./namespaces/ar/footer.js";

import esCommon from "./namespaces/es/common.js";
import esEntry from "./namespaces/es/entry.js";
import esAccount from "./namespaces/es/account.js";
import esLanding from "./namespaces/es/landing.js";
import esBuilder from "./namespaces/es/builder.js";
import esCover from "./namespaces/es/cover.js";
import esAts from "./namespaces/es/ats.js";
import esTracker from "./namespaces/es/tracker.js";
import esMaster from "./namespaces/es/master.js";
import esStatus from "./namespaces/es/status.js";
import esModal from "./namespaces/es/modal.js";
import esFooter from "./namespaces/es/footer.js";

import deCommon from "./namespaces/de/common.js";
import deEntry from "./namespaces/de/entry.js";
import deAccount from "./namespaces/de/account.js";
import deLanding from "./namespaces/de/landing.js";
import deBuilder from "./namespaces/de/builder.js";
import deCover from "./namespaces/de/cover.js";
import deAts from "./namespaces/de/ats.js";
import deTracker from "./namespaces/de/tracker.js";
import deMaster from "./namespaces/de/master.js";
import deStatus from "./namespaces/de/status.js";
import deModal from "./namespaces/de/modal.js";
import deFooter from "./namespaces/de/footer.js";

export const resources = {
  en: { common: enCommon, entry: enEntry, account: enAccount, landing: enLanding, builder: enBuilder, cover: enCover, ats: enAts, tracker: enTracker, master: enMaster, status: enStatus, modal: enModal, landing2: enLanding2, footer: enFooter },
  fr: { common: frCommon, entry: frEntry, account: frAccount, landing: frLanding, builder: frBuilder, cover: frCover, ats: frAts, tracker: frTracker, master: frMaster, status: frStatus, modal: frModal, landing2: frLanding2, footer: frFooter },
  ar: { common: arCommon, entry: arEntry, account: arAccount, landing: arLanding, builder: arBuilder, cover: arCover, ats: arAts, tracker: arTracker, master: arMaster, status: arStatus, modal: arModal, landing2: arLanding2, footer: arFooter },
  es: { common: esCommon, entry: esEntry, account: esAccount, landing: esLanding, builder: esBuilder, cover: esCover, ats: esAts, tracker: esTracker, master: esMaster, status: esStatus, modal: esModal, landing2: enLanding2, footer: esFooter },
  de: { common: deCommon, entry: deEntry, account: deAccount, landing: deLanding, builder: deBuilder, cover: deCover, ats: deAts, tracker: deTracker, master: deMaster, status: deStatus, modal: deModal, landing2: enLanding2, footer: deFooter },
};

export const translate = createTranslator(resources);
export const ns = (language, namespaceName) => namespace(resources, language, namespaceName);

function compatibility(namespaceName) {
  return Object.fromEntries(Object.keys(resources).map((language) => [language, resources[language][namespaceName]]));
}

export const UI = compatibility(NAMESPACES.UI);
export const ENTRY_UI = compatibility(NAMESPACES.ENTRY_UI);
export const ACCT_UI = compatibility(NAMESPACES.ACCT_UI);
export const LANDING_UI = compatibility(NAMESPACES.LANDING_UI);
export const BUILDER_UI = compatibility(NAMESPACES.BUILDER_UI);
export const COVER_UI = compatibility(NAMESPACES.COVER_UI);
export const ATS_UI = compatibility(NAMESPACES.ATS_UI);
export const TRACKER_UI = compatibility(NAMESPACES.TRACKER_UI);
export const MASTER_UI = compatibility(NAMESPACES.MASTER_UI);
export const STATUS_UI = compatibility(NAMESPACES.STATUS_UI);
export const MODAL_UI = compatibility(NAMESPACES.MODAL_UI);
export const LANDING2_UI = compatibility(NAMESPACES.LANDING2_UI);
export const FOOTER_UI = compatibility(NAMESPACES.FOOTER_UI);
