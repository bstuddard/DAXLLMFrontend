// Library
import { ref } from 'vue';
import JSZip from 'jszip';

// Types
import type { Ref } from 'vue';

// Incoming Data Model Schema
type PowerBIRelationship = {
    name: string;
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    type?: 'singleColumn';
    fromCardinality?: 'none' | 'one' | 'many';
    toCardinality?: 'none' | 'one' | 'many';
    crossFilteringBehavior?: 'oneDirection' | 'bothDirections' | 'automatic';
    joinOnDateBehavior?: 'dateAndTime' | 'datePartOnly';
    relyOnReferentialIntegrity?: boolean;
    isActive?: boolean;
    securityFilteringBehavior?: 'oneDirection' | 'bothDirections';
};

type Annotation = {
    name: string;
    value: string;
};

type PowerBIColumn = {
    name: string;
    dataType: string;
    sourceColumn: string;
    formatString: string;
    lineageTag: string;
    summarizeBy: string;
    annotations: Annotation[];
};

type PowerBITable = {
    name: string;
    lineageTag: string;
    columns?: PowerBIColumn[];
    partitions?: Array<{
        name: string;
        mode: string;
        source: {
            type: string;
            expression: string[];
        };
    }>;
    annotations: Annotation[];
};

type PowerBISchema = {
    name: string;
    compatibilityLevel: number;
    model: {
        culture: string;
        dataAccessOptions: {
            legacyRedirects: boolean;
            returnErrorValuesAsNull: boolean;
        };
        defaultPowerBIDataSourceVersion: string;
        sourceQueryCulture: string;
        tables?: PowerBITable[];
        relationships?: PowerBIRelationship[];
        cultures: Array<{
            name: string;
            linguisticMetadata: {
                content: {
                    Version: string;
                    Language: string;
                };
                contentType: string;
            };
        }>;
        annotations: Annotation[];
    };
};

// Outgoing Data Model Schema
type TableInfo = {
    name: string;
    columns: string[];
};

type RelationshipInfo = {
    name: string;
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    fromCardinality: 'none' | 'one' | 'many';
    toCardinality: 'none' | 'one' | 'many';
    crossFilteringBehavior: 'oneDirection' | 'bothDirections' | 'automatic';
    isActive: boolean;
    securityFilteringBehavior: 'oneDirection' | 'bothDirections';
};

type ParsedPBIResponse = {
    successful: boolean;
    error?: string;
};



export default function usePowerBIParser() {
    const isProcessing: Ref<boolean> = ref(false);
    const tables: Ref<TableInfo[]> = ref([]);
    const relationships: Ref<RelationshipInfo[]> = ref([]);

    /**
     * Parse a PowerBI template file (.pbit) and extract table/column information
     * @param file - The .pbit file to parse
     * @returns ParsedPBIResponse containing table information or error
     */
    async function parsePowerBIFile(file: File): Promise<ParsedPBIResponse> {
        try {
            // Reset state
            isProcessing.value = true;
            tables.value = [];
            relationships.value = [];

            const zip = await JSZip.loadAsync(file);
            
            // Get the schema file
            const schemaFile = zip.file('DataModelSchema');
            
            if (!schemaFile) {
                throw new Error('Could not find DataModelSchema in the PBIT file');
            }

            // Read as binary first
            const binaryContent = await schemaFile.async('uint8array');
            
            // Try UTF-16 decoding (PBIT files use UTF-16 encoding)
            const decoder = new TextDecoder('utf-16');
            const content = decoder.decode(binaryContent);
            
            // Parse the JSON
            const schemaData = JSON.parse(content) as PowerBISchema;
            
            // If we have tables, extract them
            if (schemaData.model?.tables) {
                tables.value = schemaData.model.tables.map(table => ({
                    name: table.name,
                    columns: table.columns?.map(col => col.name) || []
                }));
            }

            // Extract relationships if they exist
            if (schemaData.model?.relationships) {
                relationships.value = schemaData.model.relationships.map(rel => ({
                    name: rel.name,
                    fromTable: rel.fromTable,
                    fromColumn: rel.fromColumn,
                    toTable: rel.toTable,
                    toColumn: rel.toColumn,
                    fromCardinality: rel.fromCardinality ?? 'many',
                    toCardinality: rel.toCardinality ?? 'one',
                    crossFilteringBehavior: rel.crossFilteringBehavior ?? 'oneDirection',
                    isActive: rel.isActive ?? true,
                    securityFilteringBehavior: rel.securityFilteringBehavior ?? 'oneDirection'
                }));
            }

            return { 
                successful: true
            };

        } catch (error: unknown) {
            console.error('Error:', error);
            return { 
                successful: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            isProcessing.value = false;
        }
    }

    return {
        parsePowerBIFile,
        tables,
        relationships,
        isProcessing
    };
}
