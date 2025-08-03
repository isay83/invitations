// photos.js
const CLOUDINARY_CLOUD_NAME = 'dhujr5kiz';
const CLOUDINARY_UPLOAD_PRESET = 'graduation-photos';
const CLOUDINARY_FOLDER = 'graduation-veronica';
// URL base para mostrar fotos
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// Fotos subidas a Cloudinary con título y descripción
const cloudinaryPhotos = [
    {
        id: 'graduation-veronica/b4lpjjeov8nse3hen1ea',
        title: 'Recuerdo',
        description: 'Momento especial de graduación'
    }
];

// Fotos predeterminadas si falla la carga o no hay fotos
const defaultPhotos = [
    {
        url: './img/graduacion.png',
        title: 'Foto con Toga',
        description: 'El momento más esperado'
    },
    {
        url: './img/graduacion-2.png',
        title: 'Amigos Inseparables',
        description: 'Atardecer Inolvidable'
    },
    {
        url: './img/graduacion-3.png',
        title: 'Emma Watson',
        description: 'Una graduación mágica'
    }
];
