import { DiagnosticSeverity } from "./interfaces";

export const DiagnosticMessages = {
    genericError: (message: string) => {
        return {
            message: message,
            code: 'core1000',
            severity: DiagnosticSeverity.Error
        };
    },
    missingTemplate: (templatePath: string) => ({
        message: `Template could not be found in program with path "${templatePath}"`,
        code: 'core1001',
        severity: DiagnosticSeverity.Error
    }),
    ejsTemplateParseError: (message: string) => {
        return {
            message: `ejs parse error: ${message}`,
            code: 'core1000',
            severity: DiagnosticSeverity.Error
        };
    },
};
