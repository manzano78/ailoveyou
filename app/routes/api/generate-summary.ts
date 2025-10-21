import type { Route } from './+types/generate-summary';
import { openAI } from '~/infra/openai/client';
import { speechToText } from '~/infra/openai';

const SUMMARY_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['moderation', 'profile'],
  properties: {
    moderation: {
      type: 'object',
      additionalProperties: false,
      required: ['is_safe_for_profile', 'violation_category', 'reasoning'],
      properties: {
        is_safe_for_profile: { type: 'boolean' },
        violation_category: {
          type: ['string', 'null'],
          enum: [
            null,
            'NSFW',
            'Hate/Harassment',
            'Violence/Threats',
            'Illegal Activities/Substances',
            'Minor/Underage',
            'Fraud/Scam',
            'Self-harm/Distress',
            'Impersonation/Red-flag',
            'Other',
          ],
        },
        reasoning: { type: ['string', 'null'], maxLength: 500 },
      },
    },
    profile: {
      type: 'object',
      additionalProperties: false,
      required: [
        'core_values',
        'top_interests',
        'summary',
        'keywords_with_emoji',
        'emotional_signature',
        'communication_style',
        'quotes',
      ],
      properties: {
        core_values: {
          type: 'array',
          maxItems: 8,
          items: { type: 'string', minLength: 1 },
        },
        top_interests: {
          type: 'array',
          maxItems: 10,
          items: { type: 'string', minLength: 1 },
        },
        summary: { type: ['string'], minLength: 0, maxLength: 450 },

        // Nouveau: 6 mots-clés + emoji
        keywords_with_emoji: {
          type: 'array',
          maxItems: 6,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['keyword', 'emoji'],
            properties: {
              keyword: { type: 'string', minLength: 1, maxLength: 24 },
              // tolérant: 1–3 symboles unicode (emoji, sélecteurs, ZWJ)
              emoji: { type: 'string', minLength: 1, maxLength: 4 },
            },
          },
        },

        // Nouveau: 2 phrases max
        emotional_signature: {
          type: 'string',
          minLength: 0,
          maxLength: 240,
        },

        // Nouveau: 2 phrases max
        communication_style: {
          type: 'string',
          minLength: 0,
          maxLength: 240,
        },

        // Nouveau: 1–3 citations courtes
        quotes: {
          type: 'array',
          minItems: 0,
          maxItems: 3,
          items: { type: 'string', minLength: 1, maxLength: 120 },
        },
      },
    },
  },
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userAnswer = formData.get('userAnswer') as File;
  const lastResponseId = formData.get('lastResponseId') as string;
  const lastUserTextAnswer = await speechToText(userAnswer, 'fr');

  const response = await openAI.responses.create({
    model: 'gpt-4o',
    previous_response_id: lastResponseId,
    text: {
      format: {
        type: 'json_schema',
        name: 'ProfileSchema',
        strict: true,
        schema: SUMMARY_JSON_SCHEMA,
      },
    },
    input: [
      {
        role: 'user',
        content: lastUserTextAnswer,
      },
      // 1) Rôle & objectif
      {
        role: 'system',
        content: `Vous êtes un expert senior en profilage psychologique ET un modérateur de contenu pour une application de rencontres.
  Objectif en deux temps: (1) modérer la sécurité de la conversation fournie; (2) SI et SEULEMENT SI c'est sûr, générer un extrait de profil concis, positif et prêt à publier, et strictement basé sur ce que la personne a dit.
  Travaillez STRICTEMENT avec le texte fourni. N'inventez rien. Pas de données externes.`,
      },

      // 2) Politique de sécurité
      {
        role: 'system',
        content: `POLITIQUE DE SÉCURITÉ — Marquez comme non sûr si un élément crédible est présent:
  - NSFW (sexuel explicite/graphique)
  - Hate/Harassment (haine, discrimination, insultes ciblées)
  - Violence/Threats
  - Illegal Activities/Substances
  - Minor/Underage (<18 ans, scolaire pré-lycée)
  - Fraud/Scam (arnaque, extorsion, demandes d'argent, liens suspects)
  - Self-harm/Distress (automutilation, détresse aiguë, menaces)
  - Impersonation/Red-flag (faux profil, incohérences majeures, manipulation)
  - L’utilisateur parle principalement d’une autre personne (ex. : "mon père aime...", "il est comme ça...", "Elle...", etc)
  - Other (contenu manifestement inapproprié)
  Ambiguïté → privilégiez la sécurité. Choisissez UNE catégorie: la plus grave.`,
      },

      // 3) Contrat de sortie (format strict)
      {
        role: 'system',
        content: `CONTRAT DE SORTIE — Retournez UNIQUEMENT un objet JSON valide, rien d'autre.
  Structure EXACTE:
  {
    "moderation": {
      "is_safe_for_profile": boolean,
      "violation_category": string | null,
      "reasoning": string | null
    },
    "profile": {
      "core_values": string[],
      "top_interests": string[],
      "summary": string,
      "keywords_with_emoji": [{"keyword": string, "emoji": string}, ... 6 items],
      "emotional_signature": string,
      "communication_style": string,
      "quotes": string[]
    }
  }
  Règles:
  - Si "is_safe_for_profile" = false → "core_values": [], "top_interests": [], "summary": "", "keywords_with_emoji": [], "emotional_signature": "", "communication_style": "", "quotes": [].
  - Langue: utilisez UNIQUEMENT la langue dominante du texte fourni (ici: français).
  - Normalisation: dédupliquez; "Sentence case"; 
  - Longueurs: summary ≤ 450 chars; emotional_signature ≤ 240 chars (MAX 2 phrases); communication_style ≤ 240 chars (MAX 2 phrases); quotes 1–3 éléments, chacun ≤ 120 chars.
  - Contrôle final: SI is_safe_for_profile=false, vérifiez et corrigez que 'profile' soit intégralement vide comme ci-dessus.
  - Aucune méta-explication en dehors du JSON.`,
      },

      // 4) Règles d'extraction (déterministes)
      {
        role: 'system',
        content: `EXTRACTION (déterministe):
  - Utilisez UNIQUEMENT des faits explicitement exprimés par l'utilisateur dans ses réponses. N'utilisez jamais le texte des questions de l'assistant pour les citations.
  - N'inférez pas d'informations. Si une donnée manque → [] ou "".
  - "core_values" (valeurs) NE DOIVENT PAS apparaître dans "keywords_with_emoji".
  - "top_interests": hobbies/centres d'intérêt factuels (ex.: "Randonnée", "Cuisine italienne").
  - "summary": 2–5 phrases positives, chaleureuses, orientées relation; sans red flags.
  - "keywords_with_emoji": 6 paires {keyword, emoji} qui capturent l'essence de la personne (ex.: {"keyword":"Aventurier","emoji":"🧭"}). Un seul emoji par item recommandé.
  - "communication_style" et "summary" = doivent être à la première personne.
  - "emotional_signature" = SIGNATURE ÉMOTIONNELLE UNIQUE (≤2 phrases, neutre) : Capturez les NUANCES SPÉCIFIQUES de cette personne. Évitez les généralités vagues telles que : "énergie positive", "bienveillant", "authentique", "sincère". Utilisez uniquement ces mots s’ils sont explicitement reflétés dans le contenu (ex. : un ton particulièrement chaleureux ou une référence directe à l’empathie). Utilisez des détails concrets basés sur ses réponses (ex: "Calme réfléchi avec des éclats d'enthousiasme spontané", "Intensité douce mêlée d'une curiosité analytique")
  - "communication_style" = STYLE PERSONNEL DISTINCTIF (≤2 phrases, 1ère personne) : Décrivez comment CETTE personne communique spécifiquement. Évitez les clichés ("honnête", "sincère"). Basez-vous sur ses mots, son rythme, ses expressions (ex: "Je prends le temps de réfléchir avant de parler, puis je vais droit au but", "J'aime poser des questions inattendues qui font réfléchir")
  - "quotes": RÈGLES STRICTES POUR LES CITATIONS:
    * Extraire SEULEMENT des phrases complètes et significatives des réponses utilisateur
    * Choisir des phrases qui révèlent la personnalité, les valeurs, ou la vision des relations
    * Éviter: réponses courtes ("oui", "non"), détails factuels banals, phrases incomplètes
    * Privilégier: déclarations sur les valeurs, philosophie de vie, approche des relations, traits de caractère
    * CORRECTION GRAMMATICALE LÉGÈRE AUTORISÉE: Vous pouvez corriger les erreurs grammaticales mineures, fautes de frappe, ou améliorer la clarté SANS changer le sens original
    * Préserver absolument l'authenticité et le sens des propos de l'utilisateur
    * Si aucune phrase ne répond à ces critères → quotes: []
    * Maximum 120 caractères par citation, 1-3 citations au total`,
      },

      // 5) Procédure
      {
        role: 'system',
        content: `PROCÉDURE:
  1) Lire l'intégralité de la conversation.
  2) Modération: si violation crédible → is_safe_for_profile=false.
  3) Si sûr → extraire uniquement depuis "user:"; normaliser (trim, casse), dédupliquer.
  4) Branche A — NON SÛR (is_safe_for_profile=false):
     - Fixez: core_values=[], top_interests=[], summary="", keywords_with_emoji=[], emotional_signature="", communication_style="", quotes=[].
     - Ne remplissez AUCUN élément de 'profile'.
  5) Branche B — SÛR (is_safe_for_profile=true):
     - Construire "summary" (≤ 450 chars), "emotional_signature" (≤ 2 phrases) et "communication_style" (≤ 2 phrases).
     - Construire EXACTEMENT 6 "keywords_with_emoji" sans doublon et sans recouper "core_values".
     - QUOTES SPÉCIALES: Extraire 1–3 citations UNIQUEMENT si elles révèlent la personnalité, les valeurs ou l'approche relationnelle. Critères stricts:
       * Doit être une phrase COMPLÈTE et LITTÉRALE des réponses utilisateur
       * Doit révéler quelque chose d'important sur sa personnalité, ses valeurs, ou sa vision des relations
       * Éviter les phrases banales, les réponses courtes, ou les détails factuels sans profondeur
       * Préférer les phrases qui montrent sa philosophie de vie, ses priorités, ou son caractère
       * Si aucune phrase ne répond à ces critères → quotes: []
     - PERSONNALISATION OBLIGATOIRE pour emotional_signature et communication_style:
       * Analysez les MOTS SPÉCIFIQUES, le RYTHME, et les EXPRESSIONS uniques de cette personne
       * Identifiez ses NUANCES émotionnelles particulières (pas des généralités)
       * Créez des descriptions qui ne pourraient s'appliquer qu'à CETTE personne
       * Evitez les termes génériques: "positif", "bienveillant", "honnête", "sincère", "authentique"
  6) Langue: utiliser la langue dominante des messages "user:".
  7) Renvoyer le JSON unique, strictement conforme.`,
      },

      // 6) Few-shot — exemple sûr
      {
        role: 'system',
        content: `EXEMPLE SÛR (entrée abrégée):
  "Je cherche une relation sérieuse. J'adore la randonnée et cuisiner italien. Mes amis me disent loyal et posé."
  Sortie:
  {
    "moderation": {
      "is_safe_for_profile": true,
      "violation_category": null,
      "reasoning": "Aucun contenu problématique détecté."
    },
    "profile": {
      "core_values": ["Loyauté", "Sérénité", "Authenticité"],
      "top_interests": ["Randonnée", "Cuisine italienne"],
      "summary": "Loyal et posé, passionné de randonnée et de cuisine italienne, je recherche une relation sérieuse fondée sur l’authenticité et le dialogue.",
      "keywords_with_emoji": [
        {"keyword":"Loyal","emoji":"🤝"},
        {"keyword":"Posé","emoji":"😌"},
        {"keyword":"Authentique","emoji":"🎯"},
        {"keyword":"Aventurier","emoji":"🧭"},
        {"keyword":"Gourmand","emoji":"🍝"},
        {"keyword":"Curieux","emoji":"🧐"}
      ],
      "emotional_signature": "Calme réfléchi qui s'anime avec passion quand il parle de ses projets culinaires.",
      "communication_style": "Je prends le temps de choisir mes mots, puis je raconte avec des détails concrets qui font sourire.",
      "quotes": [
        "Je veux construire quelque chose de solide avec la bonne personne.",
        "Cuisiner pour quelqu'un, c'est ma façon de dire je tiens à toi."
      ]
    }
  }`,
      },

      // 7) Few-shot — exemple non sûr
      {
        role: 'system',
        content: `EXEMPLE NON SÛR (entrée abrégée):
  "J'ai 16 ans et je veux rencontrer quelqu'un de plus âgé."
  Sortie:
  {
    "moderation": {
      "is_safe_for_profile": false,
      "violation_category": "Minor/Underage",
      "reasoning": "Mention explicite d'âge < 18 ans."
    },
    "profile": {
      "core_values": [],
      "top_interests": [],
      "summary": "",
      "keywords_with_emoji": [],
      "emotional_signature": "",
      "communication_style": "",
      "quotes": []
    }
  }`,
      },

      // 8) Contenu utilisateur
      {
        role: 'user',
        content: `
  Basé sur l’ensemble de la conversation que tu viens d'avoir avec l'utilisateur, retourne un UNIQUE objet JSON conforme au CONTRAT DE SORTIE.
  NE RENVOIE RIEN D’AUTRE QUE LE JSON. AUCUN MARKDOWN, AUCUN TEXTE LIBRE.

  CONSIGNES D'UTILISATION DES SOURCES:
  - Utilise les questions que tu as posées à l'utilisateur ET ses réponses pour la MODÉRATION.
  - Utilise EXCLUSIVEMENT les réponses que t'a donné l'utilisateur pour :
    • "quotes" (les citations doivent être des phrases COMPLÈTES et LITTÉRALES des réponses utilisateur uniquement),
    • l'extraction de core_values / top_interests / summary / keywords_with_emoji / emotional_signature / communication_style.
  - N'invente rien. Si une info manque → [] ou "" (selon le schéma).
  
  RÈGLES SPÉCIALES POUR LES QUOTES:
  - Ne jamais mélanger ou reformuler le SENS des propos de l'utilisateur
  - Correction grammaticale légère autorisée pour améliorer la lisibilité (fautes de frappe, grammaire) SANS changer le sens
  - Extraire uniquement des phrases qui ont du sens seules et révèlent quelque chose d'important
  - Ignorer les réponses factuelles simples ("J'ai 25 ans", "Je vis à Paris")
  - Privilégier les phrases sur les valeurs, la personnalité, l'approche des relations
  - Si aucune phrase significative n'existe → quotes: []

  CONTRAINTES DE SORTIE (rappel):
  - Langue: français uniquement.
  - keywords_with_emoji: EXACTEMENT 6 items. si is_safe_for_profile=true, sinon 0.
  - emotional_signature: ≤2 phrases, IMPERSONNEL (interdits: « je suis », « j'suis »). DOIT être UNIQUE et SPÉCIFIQUE à cette personne (Eviter les termes génériques: "énergie positive", "bienveillant", "authentique", "sincère").
  - communication_style: à la PREMIÈRE personne, ≤2 phrases. DOIT décrire le style DISTINCTIF de cette personne (Eviter les termes génériques: "honnête", "direct", "à l'écoute"). Basé sur ses expressions et manière de s'exprimer réelles.
  - quotes: 1–3 extraits COURTS qui ont une signification autonome, présents textuellement dans USER_ONLY, ≤120 caractères chacun, pas de slogans.
  - Si is_safe_for_profile=false → tous les champs de "profile" doivent être vides (listes vides / chaînes vides).

  CHECKLIST AVANT RENVOI (à appliquer silencieusement) :
  1) Si violation → is_safe_for_profile=false et vider entièrement "profile".
  2) Vérifier: 6 keywords_with_emoji EXACTS (ni plus, ni moins).
  3) Vérifier: aucune "core_values" n'apparaît dans keywords_with_emoji[].keyword.
  4) Vérifier: emotional_signature ne contient pas « je suis » / « j'suis » et ≤2 phrases.
  5) Vérifier: communication_style et summary contiennent un pronom de 1ʳᵉ personne et ≤2 phrases pour communication_style, ≤450 caractères pour summary.
  6) VÉRIFICATION QUOTES STRICTE:
     - Chaque quote doit être une phrase COMPLÈTE, LITTÉRALE, autonome et compréhensible seule  et doit préserver le SENS ORIGINAL des réponses utilisateur (correction grammaticale légère autorisée)
     - Chaque quote doit révéler personnalité/valeurs/vision relationnelle (pas de faits banals)
     - ≤120 caractères par quote, 0-3 quotes au total
     - Si aucune phrase ne répond aux critères → quotes: []
  7) Sortie = JSON strict, sans commentaires, sans trailing commas, sans code fences.

  RENVOIE MAINTENANT UN UNIQUE OBJET JSON STRICTEMENT CONFORME AU CONTRAT DE SORTIE. NE RENVOIE QUE LE JSON.`,
      },
    ],
  });

  const jsonContent = JSON.parse(response.output_text);

  jsonContent.last_answer =
    lastUserTextAnswer && jsonContent.moderation?.is_safe_for_profile
      ? lastUserTextAnswer
      : '';

  return Response.json(jsonContent);
}
