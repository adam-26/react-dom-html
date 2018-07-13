# Non-deterministic warnings

The easiest way to avoid non-deterministic warnings is to nest `<Html>` component as `children` and **not** _sibling_
components, but this isn't always practical.

Non-deterministic warnings are specific to a _single prop_ value, therefore using _sibling_ `<Html>` components won't
result in any warnings **if** the _sibling_ components don't define the same prop(s).

## Why does happen?

The non-deterministic error only occurs on client renders during the _update_ lifecycle when _sibling_ `<Html>`
components exist.

This occurs because as components are updated its not possible to determine the **order** of _sibling_ components
in the `<Html>` hierarchy. If a client update results in a component being added,
removed and modified it is no longer possible to collate the html metadata in an ordered manner.

This **does not** occur on the initial render, because all components in the hierarchy are rendered in order.

## Understanding the non-deterministic warning

The non-deterministic warning includes information to assist you in identifying the sibling components responsible
for the warning.

*   Each line represents a sibling _component branch_
*   `<>` represents a component in the branch that does not include any non-deterministic `<Html>`. This provides context on how deep the conflicting components exist in the component tree.

Use the component branch information to identify the sibling components responsible for the conflict,
here is an example:

```
  // This is the first sibling component branch
  <> <- <title>Page Title</title>


  // This is the second sibling component branch
  <title>Another Title</title>
```

In this example, the `<title>` is non-deterministic because the **first** branch resolves `Page Title`
up the tree and the parent has a _sibling_ component that also defines a `<title>` value.

## Resolving the non-deterministic warning

To fix this warning, you would need to either nest the `<title>` values as parent-children. Or alternatively,
refactor your code so the `<title>` is defined by a parent of the _sibling_ components.

Alternatively, you can choose to **ignore** non-deterministic warnings using the `HtmlProvider` component.
This is done by setting the `ignoreNonDeterministicWarnings` to `true`.

```js
<HtmlProvider ignoreNonDeterministicWarnings={true}>{children}</HtmlProvider>
```

If you choose to ignore the warning, the HTML `<head>` child content will not render deterministically.
