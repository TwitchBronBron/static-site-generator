import { TextFile } from "./files/TextFile";
import type { Project } from "./Project";

export interface File {
    /**
     * The absolute path to the source file
     */
    srcPath: string;
    /**
     * The absolute output file path (i.e. where this file will reside when published)
     */
    outPath: string;
    /**
     * A list of diagnostics (issues) for this file
     */
    diagnostics: Diagnostic[];
    /**
     * Set by the project itself after the file is provided by the plugin
     */
    project?: Project;
    /**
     * Get the line of source code at the specified line index, or null if the index is invalid or out of bounds.
     * Not applicable to non-text files
     */
    getLine?(index: number): string | undefined;
    /**
     * Load the file contents from the file system. This must be done SYNCHRONOUSLY.
     */
    load?();
    /**
     * Validate the file (i.e. check it for invalid syntax or issues)
     */
    validate?();
    /**
     * Certain files may be used as a template. If so, they need to implement this method so the program can use them to generate the full file
     */
    renderAsTemplate?(file: TextFile, content: string);
    /**
     * Publish the file to the outDir. This is where files should apply any transformantions to the source file
     */
    publish?();
}

export interface Diagnostic {
    file: File;
    range?: Range;
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    relatedInformation?: DiagnosticRelatedInformation[]
}

export interface DiagnosticRelatedInformation {
    file: File;
    range?: Range;
    message: string;
}

export enum DiagnosticSeverity {
    Error = 'Error',
    Warning = 'Warning',
    Information = 'Information',
    Hint = 'Hint'
}

export interface Range {
    start: Position;
    end: Position;
}

export interface Position {
    line: number;
    character: number;
}



export interface Plugin {
    /**
     * Allow the plugin to provide a custom file class
     * Called anytime the project has a file added.
     */
    provideFile?: PluginHandler<ProvideFileEvent, File | void>
    /**
     * Emitted whenever a file is added to the project.
     */
    onFileAdd?: PluginHandler<OnFileAddEvent>;
    /**
     * Emitted whenever a file is about to be updated. This also fires right after `onFileAdd`.
     */
    beforeFileLoad?: PluginHandler<BeforeFileLoadEvent>;
    /**
     * Emitted after a file has been updated
     */
    afterFileLoad?: PluginHandler<AfterFileLoadEvent>;
    /**
     * Emitted whenveer a file is removed from the project
     */
    onFileRemove?: PluginHandler<OnFileRemoveEvent>
    /**
     * Emitted before a file's `validate` method is called. This is emitted even if the file doesn't have a `validate` method defined
     */
    beforeFileValidate?: PluginHandler<BeforeFileValidateEvent>;
    /**
     * Emitted after a file's `validate` method is called. This is emitted even if the file doesn't have a `validate` method defined
     */
    afterFileValidate?: PluginHandler<AfterFileValidateEvent>;
    /**
     * Emitted before a file's `publish` method is called
     */
    beforeFilePublish?: PluginHandler<BeforeFilePublishEvent>;
    /**
     * Emitted after a file's `publish` method is called
     */
    afterFilePublish?: PluginHandler<AfterFilePublishEvent>;
}
export type PluginHandler<T, R = void> = (event: T) => R;

export interface ProvideFileEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    srcPath: string;
    /**
     * The default outPath for this file. Files can override or modify this since files are required to have an `outPath` property, but the majority of files
     * will use this value as the baseline.
     */
    outPath: string;
}

export interface OnFileAddEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface BeforeFileLoadEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface AfterFileLoadEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface OnFileRemoveEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface BeforeFileValidateEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface AfterFileValidateEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface BeforeFilePublishEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}

export interface AfterFilePublishEvent {
    project: Project;
    /**
     * The absolute path to the source file
     */
    file: File;
}
