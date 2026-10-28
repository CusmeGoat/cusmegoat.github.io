export interface Experience {
  role: string;
  organization: string;
  period: string;
  type?: string;
  summary: string;
  highlights: string[];
}

export interface Capability {
  number: string;
  title: string;
  description: string;
  technologies: string[];
  details: string[];
}

export interface Training {
  title: string;
  area: string;
}

export interface FeaturedProject {
  title: string;
  category: string;
  challenge: string;
  contribution: string;
  outcome?: string;
  technologies: string[];
  disclosure: string;
  process?: string[];
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  introduction: string;
  about: string;
  email: string;
  github: string;
  linkedin: string;
  cv: string;
  experience: Experience[];
  capabilities: Capability[];
  stack: string[];
  projects: FeaturedProject[];
  languages: string[];
  training: Training[];
}

export const profile: Profile = {
  name: 'José Carlos Cusme Montenegro',
  role: 'Ingeniero en Sistemas de Información · Full Stack & DevOps',
  location: 'Guayaquil, Ecuador',
  introduction:
    'Desarrollo soluciones que conectan interfaces, servicios y datos. También participo en la automatización que permite llevarlas a cada ambiente con mayor consistencia.',
  about:
    'En HITSS Ecuador trabajo con Java, Spring Boot, Angular, APIs REST, Oracle y MongoDB. Mi experiencia también abarca pipelines CI/CD, contenedores y despliegues en OpenShift. Me interesa entender el recorrido completo de una solución: desde la necesidad de quien la usa hasta su operación.',
  email: 'cusmegoat2003@hotmail.com',
  github: 'https://github.com/CusmeGoat',
  linkedin: 'https://www.linkedin.com/in/jose-carlos-cusme-montenegro-a87b432b0/',
  cv: '/cv-jose-carlos-cusme-montenegro.pdf',
  experience: [
    {
      role: 'Desarrollador full stack / Ingeniero de proyectos',
      organization: 'HITSS Ecuador',
      period: 'Ene 2026 — actualidad',
      summary:
        'Desarrollo y mantenimiento de soluciones empresariales, desde la interfaz hasta la integración de datos y el despliegue.',
      highlights: [
        'Implementación de flujos de registro, consulta, edición y validación con Angular, Java y Spring Boot.',
        'Integración de APIs REST y trabajo con Oracle SQL/PLSQL y MongoDB.',
        'Configuración de pipelines CI/CD, Dockerfiles y manifiestos para Kubernetes y OpenShift 4.',
        'Apoyo a pruebas, análisis de logs y despliegues en diferentes ambientes.',
      ],
    },
    {
      role: 'Pasante desarrollador',
      organization: 'HITSS Ecuador',
      period: 'Jul 2025 — dic 2025',
      summary:
        'Participación en desarrollo, pruebas y documentación técnica de soluciones empresariales.',
      highlights: [
        'Trabajo con frontend, backend, PL/SQL y servicios REST.',
        'Uso de Postman, Jenkins, SonarQube y OpenShift 4 en el ciclo de desarrollo.',
      ],
    },
    {
      role: 'Asistente en desarrollo y soporte técnico',
      organization: 'ARCSA',
      period: 'Ene 2025 — mar 2025',
      type: 'Prácticas preprofesionales',
      summary:
        'Atención de incidencias y apoyo a actividades de desarrollo y soporte institucional.',
      highlights: [
        'Instalación y mantenimiento de software y equipos.',
        'Configuración de herramientas de correo y respaldo de información.',
      ],
    },
  ],
  capabilities: [
    {
      number: '01',
      title: 'Desarrollo Full Stack',
      description:
        'Construyo interfaces y servicios que responden a procesos reales, con atención a la integración y al mantenimiento.',
      technologies: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'APIs REST'],
      details: [
        'Desarrollo de interfaces y flujos de registro, consulta, edición y validación con Angular.',
        'Implementación e integración de servicios REST con Java y Spring Boot.',
        'Pruebas funcionales de endpoints y apoyo a la resolución de incidencias con Postman.',
      ],
    },
    {
      number: '02',
      title: 'Datos e integración',
      description:
        'Trabajo con consultas, procedimientos y modelos de datos para conectar aplicaciones con sus fuentes de información.',
      technologies: ['Oracle SQL', 'PL/SQL', 'MongoDB', 'PostgreSQL'],
      details: [
        'Consultas y lógica de datos con Oracle SQL y PL/SQL.',
        'Integración de aplicaciones con datos relacionales y documentos en MongoDB.',
        'Uso de PostgreSQL en proyectos personales.',
      ],
    },
    {
      number: '03',
      title: 'DevOps y despliegue',
      description:
        'Participo en la automatización de entrega y en la configuración de recursos para ejecutar aplicaciones en distintos ambientes.',
      technologies: ['Jenkins', 'GitLab CI/CD', 'Docker', 'Kubernetes', 'OpenShift 4'],
      details: [
        'Configuración de pipelines CI/CD y acompañamiento de despliegues en varios ambientes.',
        'Creación de Dockerfiles y manifiestos para Kubernetes y OpenShift 4.',
        'Administración de recursos de proyecto y análisis de logs durante pruebas y soporte.',
      ],
    },
    {
      number: '04',
      title: 'Exploración personal',
      description:
        'Amplío mi práctica con aplicaciones móviles, servicios y herramientas desarrolladas fuera de mi trabajo principal.',
      technologies: ['React Native', 'Node.js', 'Python', 'FastAPI', 'pgvector'],
      details: [
        'Exploración de aplicaciones móviles con React Native y TypeScript.',
        'Desarrollo personal con Node.js, Python y PostgreSQL.',
        'Interés por conectar nuevas herramientas con necesidades concretas.',
      ],
    },
  ],
  stack: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'JavaScript', 'Oracle SQL', 'PL/SQL', 'MongoDB', 'PostgreSQL', 'APIs REST', 'Jenkins', 'GitLab', 'GitHub', 'Docker', 'Kubernetes', 'OpenShift 4', 'Postman', 'SonarQube', 'React Native', 'Node.js', 'Python', 'FastAPI', 'C#', 'Dart'],
  projects: [
    {
      title: 'AgroCommunity',
      category: 'Proyecto de tesis · 2026',
      challenge: 'Una asociación agrícola de Daule necesitaba mejorar la comunicación con sus socios y darles acceso remoto a documentos institucionales que antes debían consultar presencialmente.',
      contribution: 'Desarrollé la aplicación móvil y conecté sus consultas con una API. Integré un backend para documentos y autenticación, además de un servicio que indexa PDF y recupera fragmentos relevantes desde una base vectorial para responder preguntas sobre el contenido.',
      outcome: 'La solución reúne documentos y permite consultarlos mediante una búsqueda semántica con referencia a las fuentes.',
      technologies: ['React Native', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'pgvector', 'Python', 'FastAPI', 'JWT'],
      disclosure: 'Aplicación móvil · comunicación y consulta documental',
      process: ['Documentos', 'Búsqueda semántica', 'Respuesta con fuentes'],
    },
    {
      title: 'Portal de gestión de distribuidores',
      category: 'Desarrollo full stack · empresa',
      challenge: 'Reunir en un portal solicitudes, aprobaciones y transferencias de procesos de gestión de distribuidores.',
      contribution: 'Desarrollé flujos de registro, consulta, edición y aprobación; integré frontend, servicios REST y datos en Oracle. También participé en la adaptación y despliegue de sus aplicaciones en OpenShift 4.',
      technologies: ['Angular', 'TypeScript', 'PrimeNG', 'Java 17', 'Spring Boot', 'Oracle', 'OpenShift 4'],
      disclosure: 'Descripción general · repositorio privado',
    },
    {
      title: 'Motor de decisión crediticia',
      category: 'Servicios y reglas de negocio · empresa',
      challenge: 'Evaluar solicitudes de servicios móviles y fijos con reglas de crédito y riesgo para decidir si continúan o pasan a revisión.',
      contribution: 'Participé en mejoras de servicios backend e interfaz: validaciones, reglas de evaluación, mensajes de diagnóstico para analistas, ajustes de datos y revisión del flujo de solicitudes.',
      technologies: ['Java', 'Spring', 'Angular', 'Oracle', 'MongoDB', 'RabbitMQ'],
      disclosure: 'Descripción general · repositorio privado',
    },
    {
      title: 'Carga masiva para procesos de crédito',
      category: 'Datos e integración · empresa',
      challenge: 'Incorporar grandes conjuntos de clientes desde archivos Excel y facilitar su consulta posterior.',
      contribution: 'Implementé la carga hacia Oracle y funciones de consulta paginada, búsqueda, exportación y bitácora para dar seguimiento al procesamiento.',
      technologies: ['Oracle SQL', 'Excel'],
      disclosure: 'Descripción general · repositorio privado',
    },
    {
      title: 'Intercambio protegido de listas',
      category: 'Seguridad e integración · empresa',
      challenge: 'Permitir la entrega de listas sensibles entre una aplicación local y un portal sin exponer su contenido durante el intercambio.',
      contribution: 'Trabajé en el flujo de carga local y recepción en el portal, con tratamiento controlado de los archivos y validación de integridad mediante HMAC-SHA256.',
      technologies: ['Python', 'Angular', 'Java', 'Spring Boot', 'PL/SQL', 'HMAC-SHA256'],
      disclosure: 'Descripción general · repositorio privado',
    },
    {
      title: 'Migraciones y entrega en OpenShift 4',
      category: 'DevOps · empresa',
      challenge: 'Adaptar el despliegue de aplicaciones existentes a OpenShift 4 y mantener su operación en distintos ambientes.',
      contribution: 'Ajusté imágenes y manifiestos por ambiente, revisé pipelines de Jenkins, resultados de SonarQube y el estado de servicios. Configuré recursos de proyectos para los despliegues y apoyé pruebas y puesta en producción.',
      technologies: ['GitLab', 'Jenkins', 'Docker', 'SonarQube', 'Kubernetes', 'OpenShift 4'],
      disclosure: 'Descripción general · repositorios privados',
    },
  ],
  languages: ['Java', 'TypeScript', 'JavaScript', 'Python', 'SQL / PL/SQL', 'C#', 'Dart'],
  training: [
    { title: 'OpenShift 4.20 and Docker: From Zero to Production', area: 'Contenedores' },
    { title: 'Jenkins: Beginner to Pro, Learn CI/CD Pipelines & Automation', area: 'CI/CD' },
    { title: 'Oracle PL/SQL avanzado', area: 'Datos' },
    { title: 'AWS Cloud Practitioner Essentials', area: 'Fundamentos de nube' },
  ],
};
