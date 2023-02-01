import * as hdf5js from "https://cdn.jsdelivr.net/gh/usnistgov/jsfive@master/index.js";

declare module hdf5 {
    export const __vesrion__: string;
    
    export class Group {
        //attrs: 
        private name: string;
        private parent: Group;
        private file: File;
        
        // TODO: create a proper types and implementation
        // private _dataobjects: any;
        // private _links: Map<string, number>;
        // private _attrs: Map<string, Attributes>;
        
        public constructor(
            name: string,
            dataobjects: any,
            parent: hdf5js.Group,
            getterProxy: boolean
        );
        
        public get keys(): Array<string>;
        //public get values(): Array<>;
        public length(): number;
    }
    
    export class File extends Group {
        private filename: string;
        private mode: string;
        private userblock_size: number;
        
        public constructor (fh: any, filename?: string);
    }
    
    type numbers = Array<number>;
    
    /*
        shape : tuple
          Dataset dimensions.
        dtype : dtype
          Dataset's type.
        size : int
          Total number of elements in the dataset.
        chunks : tuple or None
          Chunk shape, or NOne is chunked storage not used.
        compression : str or None
          Compression filter used on dataset.  None if compression is not enabled
          for this dataset.
        compression_opts : dict or None
          Options for the compression filter.
        scaleoffset : dict or None
          Setting for the HDF5 scale-offset filter, or None if scale-offset
          compression is not used for this dataset.
        shuffle : bool
          Whether the shuffle filter is applied for this dataset.
        fletcher32 : bool
          Whether the Fletcher32 checksumming is enabled for this dataset.
        fillvalue : float or None
          Value indicating uninitialized portions of the dataset. None is no fill
          values has been defined.
        dim : int
          Number of dimensions.
        dims : None
          Dimension scales.
        attrs : dict
          Attributes for this dataset.
        name : str
          Full path to this dataset.
        file : File
          File instance where this dataset resides.
        parent : Group
          Group instance containing this dataset.
    */
    export class Dataset extends Array {
        readonly shape: numbers;
        readonly dtype: numbers;
        
        
    }
    
    export interface IFile {
        read();
        seek();
    }
}
