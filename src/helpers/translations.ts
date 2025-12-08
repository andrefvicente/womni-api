const translations = {
  "en-US": {
    email_exists: "Email already exists",
    username_exists: "Username already exists",
    phone_exists: "Phone number already exists",
    create_failed: "Failed to create employee",
  },
  "es-ES": {
    email_exists: "El correo electrónico ya existe",
    username_exists: "El nombre de usuario ya existe",
    phone_exists: "El número de teléfono ya existe",
    create_failed: "Error al crear el empleado",
  },
  "fr-FR": { 
    email_exists: "L'email existe déjà",
    username_exists: "Le nom d'utilisateur existe déjà",
    phone_exists: "Le numéro de téléphone existe déjà",
    create_failed: "Échec de la création de l'employé",
  },
  "de-DE": {
    email_exists: "E-Mail existiert bereits",
    username_exists: "Benutzername existiert bereits",
    phone_exists: "Telefonnummer existiert bereits",
    create_failed: "Fehler beim Erstellen des Mitarbeiters",
  },
  "pt-PT": {
    email_exists: "O email já existe",
    username_exists: "O nome de utilizador já existe",
    phone_exists: "O número de telefone já existe",
    create_failed: "Erro ao criar o funcionário",
  },
  "it-IT": {
    email_exists: "L'email esiste già",
    username_exists: "Il nome utente esiste già",
    phone_exists: "Il numero di telefono esiste già",
    create_failed: "Errore durante la creazione del dipendente",
  },
};

export function getTranslation(key: string, locale: string = 'en'): string {
  // Default to English if locale not found
  const lang = translations[locale as keyof typeof translations] || translations["en-US"];
  return lang[key as keyof typeof translations["en-US"]] || key;
} 