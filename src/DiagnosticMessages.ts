import { DiagnosticSeverity } from "./interfaces";

export const DiagnosticMessages = {
    missingTemplate: (templatePath: string) => ({
        message: `Template could not be found in program with path "${templatePath}"`,
        code: 'core1000',
        severity: DiagnosticSeverity.Error
    })
};
