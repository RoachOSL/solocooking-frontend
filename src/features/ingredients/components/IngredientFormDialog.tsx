/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { FIELD_SHELL, Input } from '@/shared/components/ui/input'
import type { IngredientDto } from '@/shared/lib/api/__generated__'
import {
  useCreateIngredient,
  useDeleteIngredient,
  useUpdateIngredient,
} from '../hooks/useIngredients'
import { normalizeName } from '../normalizeName'

// The contract accepts a name and nothing else. Photo and unit are laid out and
// marked "Soon" rather than collected and silently dropped.
const UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'cup',
  'piece',
  'pinch',
] as const

function FieldLabel({
  htmlFor,
  children,
  soon = false,
}: {
  htmlFor: string
  children: ReactNode
  soon?: boolean
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </label>
      {soon && <Badge>Soon</Badge>}
    </div>
  )
}

function IngredientForm({
  ingredient,
  initialName,
  onDone,
  onBusyChange,
}: {
  ingredient?: IngredientDto
  initialName: string
  onDone: () => void
  onBusyChange: (busy: boolean) => void
}) {
  const [name, setName] = useState(ingredient?.name ?? initialName)
  const [unit, setUnit] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const create = useCreateIngredient()
  const update = useUpdateIngredient()
  const remove = useDeleteIngredient()

  // Object URLs hold the file in memory until released.
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl)
      }
    }
  }, [photoUrl])

  const normalized = normalizeName(name)
  const editing = ingredient !== undefined
  const saving = create.isPending || update.isPending
  const busy = saving || remove.isPending
  const unchanged = editing && normalized === ingredient.name

  // Reset on unmount so a stale busy flag never locks a reopen.
  useEffect(() => {
    onBusyChange(busy)
    return () => onBusyChange(false)
  }, [busy, onBusyChange])

  const errorMessage = (remove.error ?? create.error ?? update.error)?.message

  function handlePhotoChange(file: File | undefined) {
    setPhotoUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return file ? URL.createObjectURL(file) : null
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (normalized.length === 0 || busy || unchanged) {
      return
    }
    if (editing) {
      update.mutate(
        { path: { ingredientId: ingredient.id }, body: { name: normalized } },
        { onSuccess: onDone },
      )
      return
    }
    create.mutate({ body: { name: normalized } }, { onSuccess: onDone })
  }

  function handleDelete() {
    if (!editing || busy) {
      return
    }
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    // Optimistic delete: close now, the toast reports success or failure.
    remove.mutate({ path: { ingredientId: ingredient.id } })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <FieldLabel htmlFor="ingredient-name">Name</FieldLabel>
        <Input
          id="ingredient-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          autoFocus
          placeholder="Smoked paprika"
        />
        {normalized.length > 0 && normalized !== name && (
          <p className="mt-2 text-xs text-muted-foreground">
            Saved as {normalized}
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="ingredient-photo" soon>
          Photo
        </FieldLabel>
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="size-full object-cover" />
            ) : (
              <ImagePlus aria-hidden className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <input
              ref={fileInputRef}
              id="ingredient-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handlePhotoChange(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Previewed here only — the catalog has nowhere to store it yet.
            </p>
          </div>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="ingredient-unit" soon>
          Default unit
        </FieldLabel>
        <select
          id="ingredient-unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className={FIELD_SHELL}
        >
          <option value="">No default</option>
          {UNITS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted-foreground">
          Recipes carry their own unit per ingredient. This would only preselect
          it.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <DialogFooter className="sm:justify-between">
        {editing ? (
          <Button
            type="button"
            variant={confirmingDelete ? 'destructive' : 'outline'}
            disabled={busy}
            onClick={handleDelete}
          >
            {confirmingDelete ? 'Confirm delete' : 'Delete'}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onDone}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={normalized.length === 0 || busy || unchanged}
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add ingredient'}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}

export function IngredientFormDialog({
  open,
  onOpenChange,
  ingredient,
  initialName = '',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient?: IngredientDto
  initialName?: string
}) {
  const editing = ingredient !== undefined
  const [busy, setBusy] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Escape, backdrop and X all route here; hold them shut mid-save.
        if (!next && busy) {
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        onEscapeKeyDown={(event) => busy && event.preventDefault()}
        onInteractOutside={(event) => busy && event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit ingredient' : 'New ingredient'}
          </DialogTitle>
          <DialogDescription>
            The catalog stores a name today. The rest is laid out for when it
            stores more.
          </DialogDescription>
        </DialogHeader>

        {/* Mounted only while open, so every opening starts from a clean form
            seeded with the ingredient being edited or the searched name. */}
        <IngredientForm
          key={ingredient?.id ?? initialName}
          ingredient={ingredient}
          initialName={initialName}
          onDone={() => onOpenChange(false)}
          onBusyChange={setBusy}
        />
      </DialogContent>
    </Dialog>
  )
}
