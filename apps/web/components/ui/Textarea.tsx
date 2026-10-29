import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Field, controlClass, describedBy } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <Field id={areaId} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={areaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(areaId, error, hint)}
        className={cn(controlClass(!!error), 'font-medium', className)}
        {...rest}
      />
    </Field>
  );
});
