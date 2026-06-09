'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ro' | 'en';

// Dicționarul cu traducerile pentru Navbar și interfață
export const translations = {
  ro: {
    dashboard: 'Dashboard',
    myTests: 'Testele mele',
    analytics: 'Analitici',
    profile: 'Profil',
    installTitle: 'Instalare pe iPhone',
    installDesc: 'Sistemul iOS nu permite instalarea automată, dar poți adăuga VitaCheck pe ecran în câteva secunde:',
    installStep1: 'Apasă pe butonul de Distribuie (Share) din bara de jos a browserului Safari.',
    installStep2: 'Derulează în jos în meniul de opțiuni care se deschide.',
    installStep3: 'Selectează opțiunea Adaugă pe ecranul principal (Add to Home Screen).',
    gotIt: 'Am înțeles',
    installTooltip: 'Instalează VitaCheck',
    welcomeBack: 'Bine ai revenit',
    overviewText: 'Iată o prezentare generală a datelor dumneavoastră de sănătate',
    uploadTest: 'Încărcați test',
    uploadTestText: 'Adăugați un nou test medical',
    chooseFile: 'Alegeți un fișier PDF',
    uploading: 'Încărcare...',
    uploadFail: 'Încărcarea a eșuat',
    uploadSuccess: 'Testul a fost încărcat cu succes!',
    loadingDashboard: 'Se încarcă dashboard-ul...',
    viewAllTests: 'Vezi toate testele încărcate',
    viewDetailedGraphs: 'Vezi grafice detaliate',
    healthTrends: "Trendurile de sănătate",
    recentTests: 'Teste recente',
    viewAll: 'Vezi toate',
    view: 'Vezi',
    medicalAnalytics: 'Analitici medicale',
    medicalAnalyticsText: 'Urmărește evoluția testelor tale medicale în timp',
    referenceRange: 'interval de referință',
    unit: 'Unitate',
    values: 'Valorile tale',
    normalRange: 'Interval normal',
    measurements: 'măsuratori',
    clickToView: 'Apasă pe punct pentru a vedea documentul',

    myMedicalTests: 'Testele mele medicale',
    myMedicalTestsText: 'Încărcați, vizualizați și gestionați analizele medicale',
    uploadNewTest: 'Încărcați un test nou',
    pdfFilesOnly: 'Numai fișiere PDF',
    clickToSelectFile: 'Apăsați pentru a selecta fișierul',
    clickToChangeFile: 'Apăsați pentru a schimba fișierul',
    orDragAndDrop: 'sau trageți și plasați',
    uploadPdf: 'Încărcați PDF-ul',
    yourRecords: 'Înregistrările dumneavoastră',
    tests: 'e',
    noTestsUploaded: 'Niciun test încărcat',
    uploadFirstTest: 'Încărcați primul test medical pentru a începe',
    uploadedOn: 'Încărcat pe',
    testDeleteSuccess: 'Testul a fost șters cu succes.',
    testDeleteFail: 'Nu s-a putut șterge testul.',
    testDeleteConfirm: 'Sigur vreți să ștergeți acest test?',
    testDownloadFail: 'Nu s-a putut descărca fișierul',
    download: 'Descarcă',
    delete: 'Șterge',
    loadingTests: 'Se încarcă testele...',
    uploadError: 'Eroare la încarcarea fișierului.',
    back: 'Înapoi',
    analyze: 'Analizazați',
    analyzing: 'Se analizează...',
    extractedData: 'Date medicale extrase',
    collectionDate: 'Dată Colectare',
    laboratory: 'Laborator',
    testName: 'Nume Test',
    result: 'Rezultat',
    indicatorGraphic: 'Grafic Indicator',
    status: 'Status',
    high: 'Crescut',
    low: 'Deficit',

    profileSettings: 'Setări profil',
    profileSettingsText: 'Gestionați-vă informațiile personale',
    fullName: 'Numele complet',
    email: 'Adresa de e-mail',
    phoneNumber: 'Număr de telefon',
    demographics: 'Demografic',
    yearsOld: 'ani',
    male: 'Masculin',
    female: 'Feminin',
    address: 'Adresă',
    editProfile: 'Editați profilul',
    saveChanges: 'Salvați modificările',
    cancel: 'Anulează',
    accountActions: 'Acțiuni cont',
    signOutText: 'Deconectați-vă din contul dvs. pe acest dispozitiv.',
    signOut: 'Sign Out',
    emailCannotChange: 'Email (nu poate fi modificat)',
    firstName: 'Prenume',
    lastName: 'Nume',
    age: 'Vârstă',
    gender: 'Gen',
    saving: 'Se salvează...',
    profileUpdateSuccess: 'Profilul a fost actualizat cu succes!',
    profileUpdateError: 'Nu s-a putut actualiza profilul.',
  },
  en: {
    dashboard: 'Dashboard',
    myTests: 'My Tests',
    analytics: 'Analytics',
    profile: 'Profile',
    installTitle: 'Install on iOS',
    installDesc: 'iOS does not support automatic installation, but you can add VitaCheck to your home screen in just a few seconds:',
    installStep1: 'Tap the Share button at the bottom of the Safari browser.',
    installStep2: 'Scroll down the options menu.',
    installStep3: 'Select the Add to Home Screen option.',
    gotIt: 'Got it',
    installTooltip: 'Install VitaCheck',
    welcomeBack: 'Welcome back',
    overviewText: 'Here\'s an overview of your health data',
    uploadTest: 'Upload Test',
    uploadTestText: 'Add a new medical test',
    chooseFile: 'Choose PDF file',
    uploading: 'Uploading...',
    uploadFail: 'Upload failed',
    uploadSuccess: 'Test uploaded successfully!',
    loadingDashboard: 'Loading your dashboard...',
    viewAllTests: 'View all uploaded tests',
    viewDetailedGraphs: 'View detailed graphs',
    healthTrends: 'Health Trends',
    recentTests: 'Recent Tests',
    viewAll: 'View all',
    view: 'View',
    medicalAnalytics: 'Medical Analytics',
    medicalAnalyticsText: 'Track the evolution of your medical tests over time',
    referenceRange: 'Reference Range',
    unit: 'Unit',
    values: 'Your values',
    normalRange: 'Normal range',
    measurements: 'measurements',
    clickToView: 'Click point to view document',
    myMedicalTests: 'My Medical Tests',
    myMedicalTestsText: 'Upload, view, and manage your medical test records',
    uploadNewTest: 'Upload New Test',
    pdfFilesOnly: 'PDF files only',
    clickToSelectFile: 'Click to select file',
    clickToChangeFile: 'Click to change file',
    orDragAndDrop: 'or drag and drop',
    uploadPdf: 'Upload PDF',
    yourRecords: 'Your Records',
    tests: 's',
    noTestsUploaded: 'No tests uploaded yet',
    uploadFirstTest: 'Upload your first medical test to get started',
    uploadedOn: 'Uploaded on',
    testDeleteSuccess: 'Test deleted successfully.',
    testDeleteFail: 'Failed to delete the test.',
    testDeleteConfirm: 'Are you sure you want to delete this test?',
    testDownloadFail: 'Failed to download file',
    download: 'Download',
    delete: 'Delete',
    loadingTests: 'Loading your tests...',
    uploadError: 'An error occurred during upload.',
    back: 'Back',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    extractedData: 'Extracted Medical Data',
    collectionDate: 'Collection Date',
    laboratory: 'Laboratory',
    testName: 'Test Name',
    result: 'Result',
    indicatorGraphic: 'Indicator Graphic',
    status: 'Status',
    high: 'High',
    low: 'Low',

    profileSettings: 'Profile Settings',
    profileSettingsText: 'Manage your personal information',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    demographics: 'Demographics',
    yearsOld: 'years old',
    male: 'Male',
    female: 'Female',
    address: 'Address',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    accountActions: 'Account Actions',
    signOutText: 'Sign out from your account on this device.',
    signOut: 'Sign Out',
    emailCannotChange: 'Email (cannot be changed)',
    firstName: 'First Name',
    lastName: 'Last Name',
    age: 'Age',
    gender: 'Gender',
    saving: 'Saving...',
    profileUpdateSuccess: 'Profile updated successfully!',
    profileUpdateError: 'Failed to update profile.',
  }
};

interface LanguageContextType {
  language: Language;
  t: typeof translations.ro;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ro');

  // Încărcăm limba salvată din localStorage la pornire
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang === 'en' || savedLang === 'ro') {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ro' ? 'en' : 'ro';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}