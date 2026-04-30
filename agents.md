# AGENTS.md

## Project X — Contexto del producto

Project X es una aplicación web profesional creada principalmente para gestionar una firma de servicios contables, legales, fiscales y empresariales.

El objetivo principal no es construir un ERP completo desde el inicio, sino una herramienta interna de firma profesional para registrar clientes, empresas, obligaciones, declaraciones, documentos, transacciones, tareas y procesos de trabajo.

A futuro, la aplicación puede evolucionar hacia una plataforma tipo ERP ligero para clientes, pero la prioridad inicial es servir como sistema operativo interno de la firma y como portal premium para que los clientes puedan visualizar el avance de sus procesos.

## Visión del producto

Project X debe ayudar a la firma a ofrecer un servicio más organizado, transparente, moderno y profesional.

La aplicación debe permitir:

- Registrar y administrar clientes.
- Registrar una o varias empresas por cliente.
- Llevar control de obligaciones fiscales, contables, legales y administrativas.
- Registrar declaraciones, pagos, soportes, comprobantes y documentos.
- Llevar control de transacciones relevantes de cada empresa.
- Gestionar tareas internas y pendientes por cliente o empresa.
- Conservar respaldo documental de declaraciones, pagos y gestiones.
- Permitir que el cliente, en una fase posterior, ingrese con su usuario y visualice el estado de sus procesos.
- Elevar la percepción profesional del servicio.
- Brindar valor agregado frente a otros contadores, abogados o firmas tradicionales.

La aplicación debe transmitir orden, control, confianza, modernidad y servicio premium.

## Naturaleza del proyecto

Project X debe entenderse como una combinación entre:

- Sistema interno de gestión de firma contable/legal.
- CRM profesional para clientes y empresas.
- Control de obligaciones y declaraciones.
- Gestor documental.
- Gestor de tareas y procesos.
- Portal de clientes.
- Base futura para módulos ERP.

Sin embargo, en la primera versión debe evitarse construir demasiada complejidad de ERP.

## Usuarios objetivo

### Usuarios internos

- Contador público.
- Abogado.
- Administrador de la firma.
- Analista contable.
- Analista fiscal.
- Asistente administrativo.
- Colaborador externo.
- Personal autorizado de la firma.

### Usuarios externos

- Cliente.
- Empresario.
- Representante legal.
- Administrador de empresa cliente.
- Personal autorizado del cliente.

Los usuarios externos solo deben poder ver la información de sus propias empresas o procesos autorizados.

## Principios generales del producto

La aplicación debe ser:

- Minimalista.
- Moderna.
- Clara.
- Profesional.
- Fácil de usar.
- Visualmente agradable.
- Confiable.
- Rápida.
- Ordenada.
- Escalable.
- Segura.
- Pensada para uso diario.

Debe evitar:

- Pantallas sobrecargadas.
- Menús excesivamente complejos.
- Formularios innecesariamente largos.
- Lenguaje técnico innecesario para el cliente.
- Estilo visual genérico de plantilla administrativa.
- Mezclar demasiados conceptos en una sola pantalla.
- Crear funcionalidades de ERP completo antes de tiempo.

## Inspiración visual

La interfaz debe inspirarse en:

- shadcn/ui.
- Radix UI.
- Stripe.
- Linear.
- Aplicaciones SaaS modernas.
- Dashboards financieros minimalistas.
- Plataformas profesionales de gestión empresarial.

La inspiración debe tomarse en cuanto a:

- Claridad visual.
- Espaciado.
- Jerarquía.
- Tipografía.
- Uso de tarjetas.
- Tablas limpias.
- Bordes sutiles.
- Estados visuales claros.
- Experiencia premium.

No se debe copiar directamente el diseño de ninguna plataforma.

## Idioma de la aplicación

El idioma principal de la interfaz debe ser español.

Los textos visibles para el usuario deben estar en español, especialmente:

- Menús.
- Botones.
- Formularios.
- Estados.
- Mensajes de error.
- Mensajes de éxito.
- Etiquetas.
- Títulos.
- Descripciones.
- Pantallas del portal del cliente.

Se pueden mantener términos técnicos en inglés dentro del código cuando sea conveniente, por ejemplo:

- frontend.
- backend.
- API.
- dashboard.
- layout.
- component.
- hook.
- service.
- build.
- lint.
- commit.
- deploy.

## Convención recomendada de idioma en el código

Preferencia general:

- Código interno, carpetas, variables y funciones: inglés.
- Textos visibles al usuario: español.
- Documentación de negocio: español.
- Documentación técnica: español con términos técnicos en inglés cuando corresponda.

Ejemplo recomendado:

```txt
features/clients
features/companies
features/declarations
features/documents
features/tasks
features/client-portal

## Uso de shadcn/ui

- Antes de crear componentes personalizados, revisar si existe un componente de shadcn/ui adecuado.
- Usar la CLI de shadcn para agregar componentes cuando corresponda.
- Mantener consistencia con `components.json`, aliases del proyecto y tokens semánticos de Tailwind.
- Evitar colores hardcodeados como `bg-blue-500`; preferir tokens como `bg-primary`, `text-muted-foreground`, `border-border`.
- Para formularios, tablas, dashboards y paneles administrativos, priorizar patrones existentes de shadcn/ui.