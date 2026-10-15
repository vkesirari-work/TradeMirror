import {DownloadLink} from '@/components/download-link';
import {Card} from '@/components/ui/primitives';
export function JournalBackup(){return <Card>
 <h2>Keep a copy of your journal</h2>
 <p>Download private notes, tags, checklist answers, your saved plan and any matching evidence still available. Unlinked annotations are retained in the export.</p>
 <p className="fineprint">Journal/plan JSON only, up to 1,000 annotations and 5 MB. Export executions separately from Trades; download report snapshots from Reports. Restore and original-file backups are not yet supported.</p>
 <DownloadLink href="/api/exports/journal">Download journal JSON</DownloadLink>
</Card>;}
