# statigen
A static site generator with built-in support for ejs templates and markdown-to-html transformations.

**NOTE:** This is still a work in progress, but please feel free to open github issues with any problems you encounter.

## Installation
```bash
npm install statigen
```

## Usage

```bash
#generate using the default `src` and `dist` folders
npx statigen

#generate using custom source and out directories
npx statigen --sourceDir source --outDir docs
```

### Init
You can create a new project by running the `init` command. This will create a new directory and copy the default statigen template project.

```bash
npx statigen init path/to/new/folder
```

## Templates
By default, html and markdown files will look for a file called `_template` at their level or above.

### HTML templates
Place this comment somewhere in your html file, and that's where the other files will have their content embedded
```html
<!--content-->
```

For example,

__src/file1.md__
```markdown
# Cool title
```

__src/_template.html__
```html
<html>
<body>
<!--content-->
</body>
</html>
```

Produces

__dist/file1.html
```html
<html>
<body>
<h1 id="cool-title">Cool title</h1>
</body>
</html>
```

## Frontmatter

You can add frontmatter to your markdown files which can be used to override certain items. Here are the currently supported values:

- `priority` - a number specifying the priority of a file
- `parentPriority` - a number to reorder the parent folder for a file
- `title` - a title to use instead of the filename
- `parentTitle` - a title to use for the parent folder instead of the folder name
- `template` - a path to a custom template to use for the current file

Here's how you use it:

`some-folder/some-file.md`
```
---
priority: 1
parentPriority: 3
title: Some File
parentTitle: Some Folder
template: custom-template.ejs
---
Actual content
```
