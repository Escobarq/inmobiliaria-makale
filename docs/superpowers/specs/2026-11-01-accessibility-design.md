# Diseño: accesibilidad WCAG AA básica

## Intención
Hacer la homepage de Makale usable por teclado, lectores de pantalla y usuarios con necesidades de contraste o movimiento reducido, sin cambiar la identidad visual ni añadir dependencias.

## Objetivos
- Mejorar la navegación semántica y por teclado.
- Añadir foco visible y estados accesibles.
- Hacer accesibles el menú móvil y el formulario de búsqueda.
- Respetar `prefers-reduced-motion`.
- Mantener textos alternativos, dimensiones y carga optimizada de imágenes.

## No objetivos
- No crear páginas internas ni un sistema de inventario real.
- No añadir librerías de accesibilidad.
- No certificar formalmente cumplimiento legal WCAG.

## Enfoques considerados
1. **Corrección WCAG AA básica (elegido):** cambios puntuales en Astro, CSS y JavaScript; menor complejidad y cubre los riesgos visibles actuales.
2. **Añadir auditoría automática con axe:** más cobertura automática, pero añade dependencia y no sustituye la revisión manual.
3. **Auditoría avanzada multiplataforma:** más completa, pero excede el alcance de esta homepage.

## Diseño elegido
- Añadir enlace “Saltar al contenido” y `main` identificable.
- Mejorar etiquetas, `autocomplete`, `aria-live` y estados del formulario.
- Gestionar menú móvil con `aria-expanded`, `aria-controls`, `aria-hidden` y teclado.
- Añadir estilos `:focus-visible` consistentes.
- Añadir `scroll-margin-top` para destinos internos.
- Reducir animaciones y desplazamiento suave cuando el usuario lo solicite.
- Revisar contraste de colores secundarios sin rediseñar la página.

## Verificación
Ejecutar pruebas existentes, build de Astro y revisión del HTML generado; comprobar ausencia de errores de compilación y revisar navegación con teclado en la homepage.
