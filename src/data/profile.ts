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
}

export interface Training {
  title: string;
  area: string;
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
    },
    {
      number: '02',
      title: 'Datos e integración',
      description:
        'Trabajo con consultas, procedimientos y modelos de datos para conectar aplicaciones con sus fuentes de información.',
      technologies: ['Oracle SQL', 'PL/SQL', 'MongoDB', 'PostgreSQL'],
    },
    {
      number: '03',
      title: 'DevOps y despliegue',
      description:
        'Participo en la automatización de entrega y en la configuración de recursos para ejecutar aplicaciones en distintos ambientes.',
      technologies: ['Jenkins', 'GitLab CI/CD', 'Docker', 'Kubernetes', 'OpenShift 4'],
    },
    {
      number: '04',
      title: 'Exploración personal',
      description:
        'Amplío mi práctica con aplicaciones móviles, servicios y herramientas desarrolladas fuera de mi trabajo principal.',
      technologies: ['React Native', 'Node.js', 'Python', 'FastAPI', 'pgvector'],
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
