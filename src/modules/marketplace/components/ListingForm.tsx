'use client';

import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { CharacterCount } from '@/shared/components/CharacterCount';
import { ImageUploader } from '@/shared/components/ImageUploader';
import { checkField } from '@/shared/config/memberRules';
import { messageForError, messageForFieldCode, MESSAGES } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  createListing as createListingApi,
  updateListing as updateListingApi,
  uploadListingImage as uploadListingImageApi,
  deleteListingImage as deleteListingImageApi,
  type Listing,
  type ListingChanges,
} from '../api/listings';

type ListingFormProps = {
  // Present only in edit mode. A listing must exist before an image can be
  // attached to it, so the uploader below appears only then.
  listing?: Listing;
  onSaved: (listing: Listing) => void;
  onDone?: () => void;
  create?: (changes: ListingChanges) => Promise<Listing>;
  update?: (id: string, changes: ListingChanges) => Promise<Listing>;
  uploadImage?: (id: string, contentType: string, base64: string) => Promise<string>;
  removeImage?: (id: string) => Promise<void>;
};

type Draft = { title: string; description: string; price: string; category: string };

function toDraft(listing?: Listing): Draft {
  return {
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    price: listing?.price === null || listing?.price === undefined ? '' : String(listing.price),
    category: listing?.category ?? '',
  };
}

type FieldErrors = Partial<Record<string, string>>;

function findErrors(draft: Draft): FieldErrors {
  const errors: FieldErrors = {};

  const titleCode = checkField('listingTitle', draft.title, { required: true });
  if (titleCode !== null) {
    errors.title = messageForFieldCode('listingTitle', titleCode);
  }

  const descriptionCode = checkField('listingDescription', draft.description, { required: true });
  if (descriptionCode !== null) {
    errors.description = messageForFieldCode('listingDescription', descriptionCode);
  }

  const categoryCode = checkField('listingCategory', draft.category, { required: false });
  if (categoryCode !== null) {
    errors.category = messageForFieldCode('listingCategory', categoryCode);
  }

  if (draft.price.trim() !== '') {
    const price = Number(draft.price);

    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'El precio no es válido.';
    }
  }

  return errors;
}

export function ListingForm({
  listing,
  onSaved,
  onDone,
  create = createListingApi,
  update = updateListingApi,
  uploadImage = uploadListingImageApi,
  removeImage = deleteListingImageApi,
}: ListingFormProps) {
  const [draft, setDraft] = useState<Draft>(toDraft(listing));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  function set<K extends keyof Draft>(name: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const found = findErrors(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(['title', 'description', 'category', 'price'], found);
      return;
    }

    const changes: ListingChanges = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      price: draft.price.trim() === '' ? '' : Number(draft.price),
      category: draft.category.trim(),
    };

    setSaving(true);

    try {
      onSaved(listing ? await update(listing.id, changes) : await create(changes));
    } catch (caught) {
      setFailure(
        messageForError(caught, {
          byStatus: { 400: 'form_incomplete' },
          fallback: MESSAGES.save_unavailable,
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(contentType: string, base64: string) {
    if (listing === undefined) {
      throw new Error('a listing must exist before it can carry an image');
    }

    const imageUrl = await uploadImage(listing.id, contentType, base64);
    onSaved({ ...listing, imageUrl });

    return imageUrl;
  }

  async function handleImageRemove() {
    if (listing === undefined) {
      return;
    }

    await removeImage(listing.id);
    onSaved({ ...listing, imageUrl: null });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6"
    >
      {listing !== undefined && (
        <ImageUploader
          label="Imagen"
          value={listing.imageUrl}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
        />
      )}

      <Field id="title" label="Título" error={errors.title}>
        {(control) => (
          <input
            {...control}
            id="title"
            value={draft.title}
            onChange={(event) => set('title', event.target.value)}
            className={`${CONTROL_CLASS} w-full`}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="price"
          label="Precio (₡)"
          hint="Déjelo vacío si prefiere no indicar un precio."
          error={errors.price}
        >
          {(control) => (
            <input
              {...control}
              id="price"
              inputMode="numeric"
              value={draft.price}
              onChange={(event) => set('price', event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>

        <Field id="category" label="Categoría" error={errors.category}>
          {(control) => (
            <input
              {...control}
              id="category"
              value={draft.category}
              onChange={(event) => set('category', event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>
      </div>

      <Field id="description" label="Descripción" error={errors.description}>
        {(control) => (
          <div className="flex flex-col gap-1.5">
            <textarea
              id="description"
              value={draft.description}
              onChange={(event) => set('description', event.target.value)}
              {...control}
              rows={5}
              maxLength={2000}
              className={`${CONTROL_CLASS} resize-y`}
            />
            <CharacterCount field="listingDescription" value={draft.description} />
          </div>
        )}
      </Field>

      {failure !== null && (
        <p role="alert" className="text-sm text-danger">
          {failure}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onDone !== undefined && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-control border border-border px-6 py-2.5 font-medium"
          >
            {listing !== undefined ? 'Listo' : 'Cancelar'}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
        >
          {saving ? 'Guardando…' : listing !== undefined ? 'Guardar cambios' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}
