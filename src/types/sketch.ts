// Shapes for the AI Sketch API (/sketches). Styles, figure guides and limits
// all come from GET /sketches/config — nothing is hardcoded here.
import type { ClientRef, Gender, Option } from "./measurement";

export type RenderStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type SketchFilter = "all" | "brought_to_life" | "sketch_only";

export interface FigureGuide {
  gender: Gender;
  imageUrl: string;
}

export interface SketchConfig {
  styles: Option[];
  figureGuides: FigureGuide[];
  descriptionMaxLength: number;
  dailyRenderLimit: number;
}

export interface SketchRender {
  id: string;
  style: string;
  description: string | null;
  status: RenderStatus;
  resultImageUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sketch {
  id: string;
  sellerId: string;
  clientId: string | null;
  name: string;
  notes: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  client: ClientRef | null;
  latestRender?: SketchRender | null;
}

export interface SketchDetail extends Sketch {
  renders: SketchRender[];
}

export const isRenderActive = (r: Pick<SketchRender, "status">) => r.status === "PROCESSING";
