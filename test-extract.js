#!/usr/bin/env node

// Quick test script to debug the extraction
import fs from 'fs/promises';
import path from 'path';

async function testExtraction() {
    console.log('🧪 Testing data extraction...');
    
    try {
        // Test basic file access
        const testPath = './divinum-officium/web/www/horas/English/Sancti/08-21.txt';
        console.log('📁 Testing file path:', testPath);
        
        const content = await fs.readFile(testPath, 'utf-8');
        console.log('✅ File read successfully');
        console.log('📄 Content preview:', content.substring(0, 200) + '...');
        
        // Test data directory creation
        const outputDir = './src/data';
        await fs.mkdir(outputDir, { recursive: true });
        console.log('📂 Created output directory:', outputDir);
        
        // Test writing a simple file
        const testData = {
            test: 'Hello from extraction',
            timestamp: new Date().toISOString()
        };
        
        const outputPath = path.join(outputDir, 'test-output.json');
        await fs.writeFile(outputPath, JSON.stringify(testData, null, 2));
        console.log('💾 Test file written to:', outputPath);
        
        console.log('🎉 Basic extraction test passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testExtraction();