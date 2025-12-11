export type VariantDefinitions = Record<string, Record<string, string>>;

export type VariantProps<T extends (props?: any) => any> = NonNullable<Parameters<T>[0]>;

type VariantSelection<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
} & { className?: string };

type CvaOptions<V extends VariantDefinitions> = {
  variants?: V;
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
};

export function cva<V extends VariantDefinitions>(
  base: string,
  options?: CvaOptions<V>
): (props?: VariantSelection<V>) => string {
  return (props: VariantSelection<V> = {}) => {
    const classes: string[] = [base];
    const variants = options?.variants ?? ({} as V);
    const defaults = options?.defaultVariants ?? {};

    for (const key of Object.keys(variants) as Array<keyof V>) {
      const value = props[key] ?? defaults[key];
      const variantClass = value ? variants[key][value as keyof V[typeof key]] : undefined;
      if (variantClass) {
        classes.push(variantClass as string);
      }
    }

    if (props.className) {
      classes.push(props.className);
    }

    return classes.filter(Boolean).join(" ");
  };
}
