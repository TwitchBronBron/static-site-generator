import { DiagnosticSeverity } from "./interfaces";

export const DiagnosticMessages = {
    genericError: (error: Error) => {
        return {
            message: error.message,
            code: 'core1000',
            severity: DiagnosticSeverity.Error
        };
    },
    missingTemplate: (templatePath: string) => ({
        message: `Template could not be found in program with path "${templatePath}"`,
        code: 'core1001',
        severity: DiagnosticSeverity.Error
    })
};
