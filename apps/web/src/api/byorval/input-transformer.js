// Convert property names in parameters to snake case
function convertParamNamesToSnakeCase(operation) {
    if (operation.parameters) {
        operation.parameters.forEach(param => {
            if (param.name.match(/[A-Z]/)) {
                param.name = param.name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            }
        });
    }
}

// Convert property names in schemas to snake case 
// eslint-disable-next-line no-unused-vars
function convertSchemaNamesToSnakeCase(spec) {
    if (spec.components?.schemas) {
        Object.values(spec.components.schemas).forEach(schema => {
            if (schema.properties) {
                const newProperties = {};
                Object.entries(schema.properties).forEach(([key, value]) => {
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    newProperties[snakeKey] = value;
                });
                schema.properties = newProperties;
            }
            // Convert enum values to snake case
            if (schema.enum) {
                schema.enum = schema.enum.map(value =>
                    value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
                );
            }
        });
    }
}

// Convert path segments and operation summaries
function processPathsAndOperations(pathItem) {
    Object.values(pathItem).forEach(operation => {
        // Convert parameters to snake case
        convertParamNamesToSnakeCase(operation);

        // Truncate operation summaries to 80 chars
        if (operation.summary && operation.summary.length > 80) {
            operation.summary = operation.summary.substring(0, 77) + '...';
        }
    });
}

// Filter paths that start with /student/
function filterStudentPaths(spec) {
    const filteredPaths = {};

    Object.entries(spec.paths).forEach(([path, pathItem]) => {
        if (path.startsWith('/student/')) {
            // Convert path segments to snake case
            const snakePath = path.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            processPathsAndOperations(pathItem);
            filteredPaths[snakePath] = pathItem;
        }
    });

    return filteredPaths;
}

// eslint-disable-next-line no-unused-vars
function filterStudentPaths2(spec) {
    const filteredPaths = {};

    Object.entries(spec.paths).forEach(([path, pathItem]) => {
        if (path.startsWith('/student/')) {
            filteredPaths[path] = pathItem;
        }
    });

    return filteredPaths;
}

function filterStudentSchemas2(spec) {
    const filteredSchemas = {};

    Object.entries(spec.components.schemas).forEach(([schemaName, schema]) => {
        if (schemaName.startsWith('Student')) {
            filteredSchemas[schemaName] = schema;
        }
    });

    return filteredSchemas;
}

// Filter paths that start with /student/ and convert property names to snake case
export function inputTransformer(spec) {
    const filteredPaths = filterStudentPaths(spec);
    // convertSchemaNamesToSnakeCase(spec); // Pass full spec to handle all schemas
    const filteredSchemas = filterStudentSchemas2(spec);
    return {
        ...spec,
        paths: filteredPaths,
        components: {
            ...spec.components,
            schemas: filteredSchemas
        }
    };
}

export default inputTransformer;