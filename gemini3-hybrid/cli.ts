import fs from 'fs';
import path from 'path';
import { solve } from './solver';
import { GeneratedSystem } from './types';

const SYSTEM_FILE = path.join(process.cwd(), 'src', 'musicalSystems.json');

function main() {
    const args = process.argv.slice(2);
    const worldArg = args.find(a => ['Assiah', 'Yetzirah', 'Atziluth', 'Briah'].includes(a)) || 'Assiah';
    
    console.log(`Generating hybrid system for world: ${worldArg}...`);
    
    try {
        const system = solve(worldArg);
        
        // Read existing
        const content = fs.readFileSync(SYSTEM_FILE, 'utf-8');
        const json = JSON.parse(content);
        
        // Append
        json[system.system] = system;
        
        // Write back
        fs.writeFileSync(SYSTEM_FILE, JSON.stringify(json, null, 2));
        
        console.log(`Success! Generated ${system.system}`);
        console.log(`Added to ${SYSTEM_FILE}`);
        
        // Print summary
        console.log("\nTriads Generated:");
        system.chords.filter(c => c.chord.includes("Triad")).forEach(c => {
            console.log(`- ${c.chord}: ${c.chord_name} (${c.chord_tones.join(', ')})`);
        });
        
    } catch (e: any) {
        console.error("Error generating system:", e.message);
        process.exit(1);
    }
}

main();

