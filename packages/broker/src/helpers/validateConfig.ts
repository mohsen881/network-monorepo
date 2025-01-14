import Ajv, { Schema, ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'

export const validateConfig = (data: unknown, schema: Schema, contextName?: string): void|never => {
    const ajv = new Ajv({
        useDefaults: true
    })
    addFormats(ajv)
    if (!ajv.validate(schema, data)) {
        const prefix = (contextName !== undefined) ? (contextName + ': ') : ''
        throw new Error(prefix + ajv.errors!.map((e: ErrorObject) => {
            let text = ajv.errorsText([e], { dataVar: '' } ).trim()
            if (e.params.additionalProperty) {
                text += ` (${e.params.additionalProperty})`
            }
            return text
        }).join('\n'))
    }
}
