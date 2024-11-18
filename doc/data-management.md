# Data Management

We store the preprocessed data on the filesystem under
`$HOME/Documents/data/tng/webapp/`. From here the backend can load the necessary
information into the cache and serve it to the frontend.

## Frontend Data Management

Dependend on the current position and point in time, the frontend requests
specific data, and stores the returned data for the current space and time info,
as well as the current level of detail.

The data is loaded in batches, e.g. 500 data elements and pushed onto a list of
to be rendered elements for a current time point (snapnum). With this we can
render a specific point in time by iterating over the elements for that key

```
private static pcsDictonary:Record<number, Array<PointsCloudSystem>> = {}
// ...
if(this.pcsDictonary[snapnum])
  this.pcsDictonary[snapnum].forEach(element => {
    if (element.mesh)
      element.mesh.visibility = 1;
  });
```


To remember which elements we would need to load next, we store metadata about
the level of detail. This is provided to the backend when asking for new data.
```
private static _level_of_detail:Record<number, Record<number,number>> = {};
```
The first key is the snapnum (point in time), the keys of the second set are the
indices of the leafs of the octree, while the values are the loaded elements of
that leaf, e.g.:
```
snapnum: 80 -> leaf number #3: 500 loaded elements
            -> leaf number #4: 123 loaded elements
snapnum: 81 -> leaf number #3: 500 loaded elements
```
We additionally support loading only a specific percentage of the data. Similar
to the preprocessing pipeline this percentage works by focusing onto the higher
value data elements by sorting the data before returning the wanted percentage.
