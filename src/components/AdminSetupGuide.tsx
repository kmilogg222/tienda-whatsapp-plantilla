import React from 'react';
import Link from 'next/link';
import styles from './AdminSetupGuide.module.css';

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Crea tu proyecto gratis en Sanity',
    body: (
      <>
        Entra a{' '}
        <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer">
          sanity.io/manage
        </a>{' '}
        (puedes iniciar sesión con Google o GitHub) y haz clic en <strong>Create project</strong>. Cuando termine, copia el{' '}
        <strong>Project ID</strong>: son 8 letras y números, por ejemplo <code>ab12cd34</code>.
      </>
    ),
  },
  {
    title: 'Pega el Project ID en tu hosting',
    body: (
      <>
        <strong>En Vercel:</strong> abre tu proyecto → <em>Settings</em> → <em>Environment Variables</em>.{' '}
        <strong>En Netlify:</strong> <em>Site configuration</em> → <em>Environment variables</em>. Agrega estas dos:
        <span className={styles.envTable}>
          <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>
          <span>tu Project ID</span>
          <code>NEXT_PUBLIC_SANITY_DATASET</code>
          <span>
            <code>production</code>
          </span>
        </span>
      </>
    ),
  },
  {
    title: 'Vuelve a publicar la tienda',
    body: (
      <>
        Los cambios de variables solo se aplican al publicar de nuevo. <strong>Vercel:</strong> <em>Deployments</em> → menú{' '}
        <em>⋯</em> del último → <em>Redeploy</em>. <strong>Netlify:</strong> <em>Deploys</em> → <em>Trigger deploy</em>.
      </>
    ),
  },
  {
    title: 'Entra otra vez a esta página',
    body: (
      <>
        Verás el panel de tu tienda. Si Sanity muestra un aviso para <strong>autorizar este dominio</strong> (CORS), acepta
        con el botón del aviso y marca <em>Allow credentials</em>. Luego abre <strong>Primeros pasos</strong> para cargar
        una tienda de ejemplo o empezar con la tuya.
      </>
    ),
  },
];

/**
 * Se muestra en /admin cuando la tienda aún no está conectada a Sanity
 * (faltan las variables de entorno en el hosting).
 */
export const AdminSetupGuide: React.FC = () => (
  <main className={styles.page}>
    <div className={styles.card}>
      <p className={styles.eyebrow}>Panel de administración</p>
      <h1 className={styles.title}>Conecta tu tienda en 4 pasos</h1>
      <p className={styles.lead}>
        Tu tienda está funcionando en <strong>modo demostración</strong> porque aún no está conectada a Sanity, el lugar
        gratuito donde guardarás tus productos, fotos y configuración. Solo necesitas hacerlo una vez (unos 10 minutos).
      </p>

      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className={styles.help}>
        ¿Prefieres una guía con capturas? Abre <code>docs/GUIA_INSTALACION.md</code> en tu repositorio de GitHub.
      </p>

      <details className={styles.dev}>
        <summary>¿Trabajas con el código en tu computador?</summary>
        <p>
          Copia <code>.env.example</code> como <code>.env.local</code>, escribe ahí las mismas dos variables y reinicia{' '}
          <code>npm run dev</code>. En Sanity agrega <code>http://localhost:3000</code> en <em>API → CORS origins</em>{' '}
          con <em>Allow credentials</em>.
        </p>
      </details>

      <Link href="/" className={styles.back}>
        ← Ver la tienda de demostración
      </Link>
    </div>
  </main>
);
