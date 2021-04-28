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
