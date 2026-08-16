# TINYTOWN.md Corrections

## Verified Errors

| Index Range | Original Claim | Verified Reality |
|-------------|----------------|------------------|
| 3–11 | Dirt path variants (straight, T-junction, cross, corner, end cap) | Trees and conifers — foliage, not terrain/path |
| 48–67 | Wooden walls with brick/stone patterns (red brick, blue-grey stone, orange brick families) | Patterned blocks of unconfirmed function — not verified as walls |
| 96–107 | Fences (wooden post-and-rail, stone wall sections, corners, gates, hedges) | Barred or grated pieces — not fences |
| 111–114 | Wells or fountains (circular stone structures, some with buckets) | Tools — not wells or fountains |

## Error Distribution Analysis

### Where errors occurred relative to uncertainty flags

**Tiles 3–11**: Flagged as uncertain in the original document ("the exact direction each represents is hard to confirm from the screenshot alone"). Despite this explicit uncertainty, a confident categorical claim was still made: "orange/brown = dirt path." The uncertainty flag did not prevent the error; it merely acknowledged that the specific sub-classification might be wrong while accepting the broader category as correct. The broader category was itself wrong.

**Tiles 48–67**: Flagged as uncertain ("difficult to distinguish precisely," "exact differences between variants within a family are not clear"). Again, uncertainty was noted but the fundamental classification as "walls" was asserted without qualification. The entire category assignment was incorrect.

**Tiles 96–107**: No explicit uncertainty flag in the original text. The fence classification was stated confidently, with only minor hedging about connectivity rules ("cannot be determined from static images alone"). The core identification — that these are fences at all — was presented as fact. It was false.

**Tiles 111–114**: No explicit uncertainty flag. Classified confidently as "wells or fountains" with speculative sub-variants ("possibly with bucket"). The entire classification was wrong.

### Pattern

Errors cluster **both** where uncertainty was flagged and where confidence was expressed. The uncertainty flags were real but insufficient: they questioned *sub-classifications* (which path direction, which brick variant, which fence piece) while accepting the *parent category* (path, wall, fence, well) as given. The parent categories themselves were hallucinated.

The model's uncertainty calibration operated at the wrong level of granularity. It knew it couldn't distinguish tile 5 from tile 8, but it did not know it couldn't distinguish "dirt path" from "tree." Confidence was misplaced one level up the taxonomy.

## What This Says About Unsupervised Vision Model Tile Dictionary Authoring

A vision model cannot reliably author a tile dictionary unsupervised from a single static screenshot of an unlabeled tileset. The failure mode is not random noise — it is **plausible inference**. The model sees small pixel clusters and maps them to the most probable semantic category given its training distribution over "village tilesets." Trees that look like brown-orange vertical shapes get labeled as dirt paths because dirt paths are expected in that position of a village tileset. Patterned blocks get labeled as brick walls because brick walls are expected. Barred pieces get labeled as fences. Circular objects get labeled as wells.

The model is not reading pixels; it is completing a prior. When the prior matches reality, the output looks correct. When the prior diverges from this specific asset pack's actual design decisions, the output is confidently wrong in ways that are internally consistent and superficially plausible.

Uncertainty flags do not solve this because they are calibrated against the wrong hypothesis space. The model knows when it cannot distinguish between two options *within* a category it has already committed to. It does not know when the category itself is a hallucination.

**Conclusion**: A vision model can produce a *draft* tile dictionary that accelerates human verification, but it cannot produce a *reliable* tile dictionary without ground-truth labels or iterative correction against in-engine placement results. The draft will contain systematic errors that follow the model's priors, not the asset pack's actual semantics. Those errors will be concentrated exactly where the model's priors are strongest — which is also where the model feels most confident.

Preserving `TINYTOWN.md` unmodified is necessary because it documents the failure mode itself. The corrected version should be written as a new file (`TINYTOWN_verified.md` or similar) once all tiles have been validated through in-engine testing or access to the asset pack's official documentation.
