#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting JWKS..."
npx convex env set "JWKS" -- "{\"keys\":[{\"use\":\"sig\",\"kty\":\"RSA\",\"n\":\"sCLLzYBz2fT-yqFKnREWdYAAssMkkvvXvXPHYh3u6KKfQBLER77Z5oyjfL-SXOzspreK2zKU4Co9ErLthg0p8D4-WrmBwTDB2QcmIUrBkFs0ZteIrQQL_rCqlFo2JemLJz51IOVEVecOkdrIOq_4yf6sSSt1ertmEEbK3-0lGvtTO2AdFxhpQhRX5HrIJIA8x52Gz_sD6njy08tjwwPNPBJDYvtDOslUj7bfcA28OXS9ZaFR_OBaWrNtSj3N2vIKZDxyhMlTZQ5CC2Em27zrGlHJta8GNswHy7-BHwxx1uHpzpV3EMOtSa7x4C6yw40KiI4TOBVHGcYB8F0EufhYew\",\"e\":\"AQAB\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
npx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwIsvNgHPZ9P7K oUqdERZ1gACywySS+9e9c8diHe7oop9AEsRHvtnmjKN8v5Jc7Oymt4rbMpTgKj0S su2GDSnwPj5auYHBMMHZByYhSsGQWzRm14itBAv+sKqUWjYl6YsnPnUg5URV5w6R 2sg6r/jJ/qxJK3V6u2YQRsrf7SUa+1M7YB0XGGlCFFfkesgkgDzHnYbP+wPqePLT y2PDA808EkNi+0M6yVSPtt9wDbw5dL1loVH84Fpas21KPc3a8gpkPHKEyVNlDkIL YSbbvOsaUcm1rwY2zAfLv4EfDHHW4enOlXcQw61JrvHgLrLDjQqIjhM4FUcZxgHw XQS5+Fh7AgMBAAECggEAHGdYF0kuJYlRJ0sQVbjiNsuQEUPP25YaSdZoYkWyd7h1 1ubP2UQJLpkiaiUYjLy2QwJZNZT4FhgppiDNle78gt3+vzGoH4fl0sJI31iHU2ip 0CXUyBXde1JxB6Bul/mL86WqTMY8GWA75MBzxqcHB0f274u/E64xvNE1uRusfqeh RdHRdI0dyyT0OYex9OCioJtajl8iY9oybsLHLU56Aiyah5wBGqJSMMvlBkpaNUz5 N5urse1np0vDj3HlpvI0iJyO950Sptg9tif9lAOCQE7ZnWRy8nGc3TTu+gkzVAVV WCvR3wFx+qK/3dSIDE3odoe2dHRfDQQpaEhS6WfhkQKBgQDfoFKY8FflVlHRgPMm ML7zMA1FrchyTnSaB6aSjmOBCEzuHnhnizzi8Thl+jF0iM+BI/N0UJ48Fi5S02jb G1JKqNh6h2+hmNdlwpBCI+jWqMA0jP+6mZOU8lNwYUx8HPVIweHwXB9WKB1e6d4l AzEV7SdCJUu3EYA5nb6u69U0CwKBgQDJonZ6x796PNDeO85gQgFFr7Ci89FwzMBb urwK3b816doTN/mYAOczAxoWPSIjlQCwSEtz8xVsyyQOxYVivCOt+yScmr/+Xk4s dv36jhDlr4pj64IZaitTD6NQPgrS+R43eVAaJ6H0a7WhPVnSak7t3+NADwyTQbZM w09gNyxDUQKBgESi/ZcJdcDjPJuT+41GOuWDYx921mYXJHy+SmcDIxFQjeQsIAKP 3vE83nWWVCWTdDUL5sZVlCuXF0K+tplBioF1z3PUK/QqaDpIfGSAhw+TneLDQB5y 0rRNqER+6K3TaYmaUJGohMm56EHggBlWIHO9ZWZM8i9PRM7qVsNziO2/AoGBAIlI iRyNlawXbipxU9Er/4u/1CcOlKIVdj6+RDutwPtnLih5qwG4U7Hiwcc0dmL9l0tu 3ZijgAnjwbgg+fFAoZZacRIDNwdslBMoLUKDqbOIslPXzGubYsYZ1prSszHzlYQ1 n7k/FMDC+RZAHEDsSrMhBave0zQLwKBBNnEO/58RAoGAdUSVPRaJOS/VUETEfOx3 b63zjG7gmS8D2cA1SSTVJQb8Xnto40jsUicmvghV3MHIio+aCwWbSRX1Nf68OsSN vX0iUq4x142U5Lx7HNy7o1SZCFKzvhHil+duMp4cUf02fIjeXsnORMxGSDEhm6dZ 4r/zu9WAmvqL6PkouvsHfnY"

echo "Setting SITE_URL..."
npx convex env set "SITE_URL" -- "http://localhost:5173"

echo "Setting VLY_APP_NAME..."
npx convex env set "VLY_APP_NAME" -- "Cyber Security Portfolio"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"
