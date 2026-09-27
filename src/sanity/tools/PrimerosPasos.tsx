'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClient, useWorkspace, type Tool } from 'sanity';
import { Badge, Box, Button, Card, Container, Dialog, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';
import { RocketIcon } from '@sanity/icons/Rocket';
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle';
import { CircleIcon } from '@sanity/icons/Circle';
import { DownloadIcon } from '@sanity/icons/Download';
import { TrashIcon } from '@sanity/icons/Trash';
import {
  DEMO_ASSET_SOURCE,
  DEMO_ID_PREFIX,
  buildDemoDocuments,
  buildDemoHomePage,
  buildDemoSettings,
  demoImageFiles,
} from '../../lib/demo/sanityDocuments';
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS, demoImageUrl } from '../../lib/demo/data';

const API_VERSION = '2024-01-01';

interface Status {
  storeName: string | null;
  whatsappNumber: string | null;
  hasLogo: boolean;
  categories: number;
  products: number;
  homeSections: number;
  demoDocs: number;
}

// Solo documentos publicados: es lo que ve la web
const STATUS_QUERY = `{
  "settings": *[_type == "storeSettings" && !(_id in path("drafts.**"))] | order(_createdAt asc) [0]{
    storeName, whatsappNumber, "hasLogo": defined(logo.asset)
  },
  "categories": count(*[_type == "category" && !(_id in path("drafts.**"))]),
  "products": count(*[_type == "product" && !(_id in path("drafts.**"))]),
  "homeSections": count(*[_type == "homePage" && !(_id in path("drafts.**"))] | order(_createdAt asc) [0].sections),
  "demoDocs": count(*[string::startsWith(_id, $prefix) || string::startsWith(_id, "drafts." + $prefix)])
}`;

async function fetchStatus(client: ReturnType<typeof useClient>): Promise<Status> {
  const data = await client.fetch<{
    settings: { storeName?: string; whatsappNumber?: string; hasLogo?: boolean } | null;
    categories: number;
    products: number;
    homeSections: number;
    demoDocs: number;
  }>(STATUS_QUERY, { prefix: DEMO_ID_PREFIX });
  return {
    storeName: data.settings?.storeName ?? null,
    whatsappNumber: data.settings?.whatsappNumber ?? null,
    hasLogo: Boolean(data.settings?.hasLogo),
    categories: data.categories,
    products: data.products,
    homeSections: data.homeSections,
    demoDocs: data.demoDocs,
  };
}

type Message = { tone: 'positive' | 'caution' | 'critical'; text: string };
type Pending = 'load' | 'delete' | null;

function Step({ done, title, hint, href, action }: { done: boolean; title: string; hint: string; href: string; action: string }) {
  return (
    <Card padding={3} radius={2} shadow={1} tone={done ? 'positive' : 'default'}>
      <Flex align="center" gap={3}>
        <Text size={3}>{done ? <CheckmarkCircleIcon /> : <CircleIcon />}</Text>
        <Stack flex={1} gap={2}>
          <Text weight="semibold">{title}</Text>
          <Text size={1} muted>
            {hint}
          </Text>
        </Stack>
        <Button as="a" href={href} text={done ? 'Revisar' : action} mode={done ? 'ghost' : 'default'} tone="primary" />
      </Flex>
    </Card>
  );
}

function PrimerosPasos() {
  const client = useClient({ apiVersion: API_VERSION });
  const { basePath } = useWorkspace();
  const link = (paneId: string) => `${basePath}/structure/${paneId}`;

  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const refresh = useCallback(async () => setStatus(await fetchStatus(client)), [client]);

  useEffect(() => {
    let active = true;
    fetchStatus(client)
      .then((next) => active && setStatus(next))
      .catch(() => active && setMessage({ tone: 'critical', text: 'No se pudo leer el estado de la tienda. Recarga la página.' }));
    return () => {
      active = false;
    };
  }, [client]);

  const loadDemo = async () => {
    setPending(null);
    setMessage(null);
    try {
      // 1. Fotos
      const files = demoImageFiles();
      const assets: Record<string, string> = {};
      for (const [index, file] of files.entries()) {
        setBusy(`Subiendo fotos de ejemplo (${index + 1} de ${files.length})…`);
        const response = await fetch(demoImageUrl(file));
        if (!response.ok) throw new Error(`No se encontró la foto ${file}`);
        const asset = await client.assets.upload('image', await response.blob(), {
          filename: `${file}.webp`,
          source: { name: DEMO_ASSET_SOURCE, id: file },
        });
        assets[file] = asset._id;
      }

      // 2. Categorías, marcas y productos
      setBusy('Creando categorías, marcas y productos…');
      const transaction = client.transaction();
      for (const doc of buildDemoDocuments(assets)) transaction.createOrReplace(doc);
      await transaction.commit();

      // 3. Configuración y portada: solo si no existen (nunca se reemplazan las de la dueña)
      setBusy('Revisando configuración y portada…');
      const existing = await client.fetch<{ settings: number; home: number }>(
        `{"settings": count(*[_type == "storeSettings"]), "home": count(*[_type == "homePage"])}`
      );
      const skipped: string[] = [];
      if (existing.settings === 0) await client.createIfNotExists(buildDemoSettings());
      else skipped.push('configuración');
      if (existing.home === 0) await client.createIfNotExists(buildDemoHomePage(assets));
      else skipped.push('portada');

      await refresh();
      setMessage({
        tone: 'positive',
        text:
          'Listo: la tienda de ejemplo está cargada. Abre tu tienda y recarga la página para verla.' +
          (skipped.length ? ` Tu ${skipped.join(' y tu ')} ya existía${skipped.length > 1 ? 'n' : ''}, así que no se cambió.` : '') +
          (existing.settings === 0 ? ' Recuerda escribir tu número de WhatsApp en Configuración.' : ''),
      });
    } catch (error) {
      console.error(error);
      setMessage({
        tone: 'critical',
        text: `No se pudo cargar la tienda de ejemplo: ${error instanceof Error ? error.message : 'error desconocido'}. Puedes intentarlo de nuevo.`,
      });
    } finally {
      setBusy(null);
    }
  };

  const deleteDemo = async () => {
    setPending(null);
    setMessage(null);
    try {
      setBusy('Borrando productos, categorías y marcas de ejemplo…');
      const ids = await client.fetch<string[]>(
        `*[string::startsWith(_id, $prefix) || string::startsWith(_id, "drafts." + $prefix)]._id`,
        { prefix: DEMO_ID_PREFIX }
      );

      const notDeleted: string[] = [];
      try {
        const transaction = client.transaction();
        ids.forEach((id) => transaction.delete(id));
        await transaction.commit();
      } catch {
        // Alguno está en uso por un documento tuyo: se borran uno por uno los que se pueda
        for (const id of ids) {
          await client.delete(id).catch(() => notDeleted.push(id));
        }
      }

      setBusy('Borrando fotos de ejemplo…');
      const assetIds = await client.fetch<string[]>(`*[_type == "sanity.imageAsset" && source.name == $source]._id`, {
        source: DEMO_ASSET_SOURCE,
      });
      let assetsInUse = 0;
      for (const id of assetIds) {
        await client.delete(id).catch(() => assetsInUse++);
      }

      await refresh();
      const notes = [
        notDeleted.length
          ? `${notDeleted.length} elemento(s) no se borraron porque los usa algún producto tuyo (por ejemplo, una categoría de ejemplo que asignaste a un producto propio).`
          : '',
        assetsInUse ? `${assetsInUse} foto(s) siguen en uso (por ejemplo en la portada) y no se borraron.` : '',
        'La configuración y la portada no se borran: revísalas y cámbialas por las tuyas.',
      ].filter(Boolean);
      setMessage({ tone: notDeleted.length ? 'caution' : 'positive', text: `Datos de ejemplo borrados. ${notes.join(' ')}` });
    } catch (error) {
      console.error(error);
      setMessage({ tone: 'critical', text: 'No se pudieron borrar los datos de ejemplo. Intenta de nuevo.' });
    } finally {
      setBusy(null);
    }
  };

  const steps = status
    ? [
        {
          done: Boolean(status.whatsappNumber),
          title: 'Escribe tu número de WhatsApp',
          hint: 'Ahí te llegarán los pedidos. Va con código de país, sin + ni espacios (ej. 573001234567).',
          href: link('storeSettings'),
          action: 'Configurar',
        },
        {
          done: Boolean(status.storeName) && status.storeName !== 'Glow Studio',
          title: 'Ponle nombre a tu tienda',
          hint: 'Se ve en el encabezado y cuando compartes tu enlace.',
          href: link('storeSettings'),
          action: 'Configurar',
        },
        {
          done: status.hasLogo,
          title: 'Sube tu logo (recomendado)',
          hint: 'En Configuración → Marca. Si no tienes, se muestra el nombre.',
          href: link('storeSettings'),
          action: 'Subir logo',
        },
        {
          done: status.categories > 0,
          title: 'Crea al menos una categoría',
          hint: 'Ej.: Maquillaje, Cuidado de la piel, Cabello.',
          href: link('orderable-category'),
          action: 'Crear',
        },
        {
          done: status.products > 0,
          title: 'Publica al menos un producto',
          hint: 'Con foto, precio y categoría. Presiona "Publish" para que se vea en la web.',
          href: link('productos'),
          action: 'Crear',
        },
        {
          done: status.homeSections > 0,
          title: 'Arma tu portada (opcional)',
          hint: 'Banner, estantes de productos, categorías… Si no la armas, se muestra una automática.',
          href: link('homePage'),
          action: 'Armar',
        },
      ]
    : [];
  const completed = steps.filter((s) => s.done).length;

  return (
    <Box padding={[3, 4, 5]} style={{ overflowY: 'auto', height: '100%' }}>
      <Container width={2}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Heading size={3}>¡Bienvenida a tu panel! 👋</Heading>
            <Text muted>
              Sigue estos pasos para dejar lista tu tienda. Los cambios se ven en la web cuando los publicas (botón
              &quot;Publish&quot;) y recargas la página.
            </Text>
          </Stack>

          {message && (
            <Card padding={3} radius={2} tone={message.tone} border>
              <Text size={1}>{message.text}</Text>
            </Card>
          )}

          {!status ? (
            <Flex justify="center" padding={5}>
              <Spinner muted />
            </Flex>
          ) : (
            <Stack gap={3}>
              <Flex align="center" gap={2}>
                <Heading size={1}>Lista de tareas</Heading>
                <Badge tone={completed === steps.length ? 'positive' : 'primary'}>
                  {completed} de {steps.length}
                </Badge>
              </Flex>
              {steps.map((step) => (
                <Step key={step.title} {...step} />
              ))}
            </Stack>
          )}

          <Card padding={4} radius={3} border tone="primary">
            <Stack gap={4}>
              <Stack gap={3}>
                <Heading size={1}>Tienda de ejemplo</Heading>
                <Text size={1} muted>
                  Carga una tienda de belleza completa ({DEMO_CATEGORIES.length} categorías, {DEMO_BRANDS.length} marcas y{' '}
                  {DEMO_PRODUCTS.length} productos con tonos y fotos) para ver cómo funciona todo. Después puedes borrarla
                  con un clic: solo se borra lo de ejemplo, nunca lo tuyo.
                </Text>
                {status && status.demoDocs > 0 && (
                  <Text size={1}>
                    Tienes <strong>{status.demoDocs}</strong> elemento(s) de ejemplo cargados.
                  </Text>
                )}
              </Stack>
              {busy ? (
                <Flex align="center" gap={3}>
                  <Spinner />
                  <Text size={1}>{busy}</Text>
                </Flex>
              ) : (
                <Flex gap={3} wrap="wrap">
                  <Button icon={DownloadIcon} text="Cargar tienda de ejemplo" tone="primary" onClick={() => setPending('load')} />
                  <Button
                    icon={TrashIcon}
                    text="Borrar datos de ejemplo"
                    tone="critical"
                    mode="ghost"
                    disabled={!status || status.demoDocs === 0}
                    onClick={() => setPending('delete')}
                  />
                </Flex>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>

      {pending && (
        <Dialog
          id="confirmar-datos-ejemplo"
          header={pending === 'load' ? '¿Cargar la tienda de ejemplo?' : '¿Borrar los datos de ejemplo?'}
          onClose={() => setPending(null)}
          width={1}
          footer={
            <Flex gap={2} justify="flex-end" padding={3}>
              <Button text="Cancelar" mode="ghost" onClick={() => setPending(null)} />
              {pending === 'load' ? (
                <Button text="Sí, cargar" tone="primary" onClick={loadDemo} />
              ) : (
                <Button text="Sí, borrar" tone="critical" onClick={deleteDemo} />
              )}
            </Flex>
          }
        >
          <Box padding={4}>
            <Text size={1}>
              {pending === 'load'
                ? 'Se agregarán productos, categorías, marcas y fotos de ejemplo. Si ya tienes configuración o portada, no se tocan. Tus productos no se modifican. Tarda cerca de un minuto.'
                : 'Se borrarán solo los productos, categorías, marcas y fotos de ejemplo. Tus propios productos no se tocan.'}
            </Text>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

export const primerosPasosTool: Tool = {
  name: 'primeros-pasos',
  title: 'Primeros pasos',
  icon: RocketIcon,
  component: PrimerosPasos,
};
