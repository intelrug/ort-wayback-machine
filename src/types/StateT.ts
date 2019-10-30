import RecordT from '@/types/RecordT';
import TrackT from '@/types/TrackT';

interface StateT {
  records: RecordT[];
  tracks: TrackT[];
  selectedRecordId: number;
}

export default StateT;
