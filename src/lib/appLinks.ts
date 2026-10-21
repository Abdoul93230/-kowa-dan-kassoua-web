// Liens vers l'application mobile (modifiables sans toucher au code via les variables d'environnement)
export const APP_LINKS = {
  android:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
    'https://play.google.com/store/apps/details?id=com.kowadankassoua.mobile',
  ios: process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/app/id6818821961',
};
