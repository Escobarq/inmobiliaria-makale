# Diseño: CSS responsive, compatible y con movimiento

## Intención
Mejorar la base CSS de la homepage de Makale para que dependa menos de valores fijos, se adapte mejor a distintos tamaños de pantalla y ofrezca animaciones discretas sin perjudicar rendimiento ni accesibilidad.

## Alcance elegido
- Sustituir tamaños fijos de espaciado, tipografía y layout por `rem`, `%`, `fr`, `clamp()`, `min()`, `max()` y unidades de viewport cuando corresponda.
- Mantener valores equivalentes para bordes, contornos e iconos donde la precisión de un píxel sea necesaria, usando tokens para evitar repetición.
- Añadir fallbacks y consultas `@supports` solo para propiedades con diferencias relevantes entre navegadores.
- Mejorar el menú móvil para que su apertura y cierre tengan transición visual sin depender de `display: none` durante la animación.
- Añadir animaciones ligeras de entrada, hover y desplazamiento visual para hero, tarjetas, servicios y botones.
- Respetar `prefers-reduced-motion: reduce`, desactivando animaciones y transiciones no esenciales.

## No objetivos
- No añadir librerías de animación.
- No rediseñar la identidad visual, el contenido ni la estructura de la homepage.
- No usar parallax agresivo ni animaciones que puedan distraer o afectar el rendimiento móvil.
- No eliminar todos los valores de píxel de SVG o líneas finas cuando eso reduzca la precisión visual o la compatibilidad.

## Enfoque
Se conservará el archivo `src/styles/global.css` y se consolidarán variables CSS para tamaños, espacios, radios, sombras, duración y easing. Las reglas modernas tendrán fallbacks razonables para navegadores antiguos. Las animaciones serán principalmente CSS; el JavaScript solo mantendrá el estado existente del menú y la preferencia de movimiento reducido.

## Compatibilidad y accesibilidad
- Usar propiedades estándar ampliamente soportadas y `@supports` solo cuando aporte una mejora segura.
- Mantener foco visible, contraste AA, navegación por teclado y dimensiones táctiles.
- Evitar animar layout de forma costosa; priorizar `transform` y `opacity`.
- Mantener una alternativa sin animación para usuarios con `prefers-reduced-motion`.

## Verificación
- Tests existentes.
- Build de Astro.
- Revisión visual en escritorio y móvil.
- Auditoría Lighthouse de accesibilidad y rendimiento.
- Comprobación de estilos con búsqueda de valores fijos innecesarios y de reglas de movimiento reducido.
