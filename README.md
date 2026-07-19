# GUSTAVE SECURITY SHIELD — déploiement Netlify

## ⚠️ Avant tout : ta clé compromise
Si tu as collé une clé OpenRouter dans un chat, une capture d'écran, ou n'importe où en dehors d'un fichier `.env` local, **révoque-la immédiatement** sur openrouter.ai (section API Keys → supprimer) et génère-en une nouvelle. Une clé vue une seule fois hors de son usage prévu doit être considérée grillée.

## 1. Récupérer une clé API OpenRouter
1. Va sur https://openrouter.ai → connecte-toi → section **Keys**.
2. Crée une nouvelle clé et copie-la (elle ne sera affichée qu'une fois).
3. **Important** : dans les paramètres de facturation / limites, fixe un **plafond de dépense** si l'option existe, ou surveille ta consommation régulièrement. Comme la clé sert à tous les visiteurs du site, c'est ta seule vraie protection contre une facture inattendue.

## 2. Mettre le projet sur GitHub
```bash
cd gustave-security-shield
git init
git add .
git commit -m "Initial commit"
```
Crée un dépôt vide sur GitHub, puis :
```bash
git remote add origin https://github.com/TON_COMPTE/gustave-security-shield.git
git push -u origin main
```

## 3. Connecter à Netlify
1. Sur netlify.com → **Add new site > Import an existing project**.
2. Choisis ton dépôt GitHub.
3. Build settings (normalement auto-détectées via `netlify.toml`) :
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Functions directory : `netlify/functions`
4. **Avant de déployer**, va dans **Site configuration > Environment variables** et ajoute :
   - Key : `OPENROUTER_API_KEY`
   - Value : ta nouvelle clé (jamais l'ancienne, jamais celle collée dans un chat)
5. Déploie.

## 4. Tester en local (optionnel)
```bash
npm install
npm install -g netlify-cli   # une seule fois
netlify dev
```
Ça lance le site ET les fonctions ensemble sur http://localhost:8888, avec ta clé lue depuis un fichier `.env` local (à créer, jamais à commit) :
```
OPENROUTER_API_KEY=ta_clé_ici
```

## Sécurité — points essentiels
- La clé API n'est **jamais** dans le code envoyé au navigateur : elle vit uniquement côté serveur (`netlify/functions/analyze.js`), lue via `process.env.OPENROUTER_API_KEY`.
- Le fichier `.gitignore` exclut `.env` pour éviter de la committer par erreur.
- Ne colle jamais une clé API dans un chat, un ticket, une capture d'écran ou un message — considère-la grillée si tu le fais et révoque-la.
- La fonction limite la taille des messages envoyés (4000 caractères max) pour éviter les abus grossiers.
- Pense à surveiller ta consommation régulièrement sur openrouter.ai tant que le site est ouvert au public.

