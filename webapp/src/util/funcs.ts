/**
 * Wraps the given HoC in logic that will add a better name to all
 * components created by it, reflecting how that component has been
 * wrapped. Removes boilerplate code that was included in every HoC.
 * @param hoc The HoC to wrap in name logic
 * @param name The name of this HoC
 */
export function makeHoc<InnerProps, OuterProps>(
  hoc: (
    Component: React.ComponentType<InnerProps>
  ) => React.ComponentType<OuterProps>,
  name: string
): (
  Component: React.ComponentType<InnerProps>
) => React.ComponentType<OuterProps> {
  return Component => {
    const WrappedComponent: React.ComponentType<OuterProps> = hoc(Component);

    const wrappedName = Component.displayName || Component.name || 'Component';
    WrappedComponent.displayName = `${name}(${wrappedName})`;
    return WrappedComponent;
  };
}
