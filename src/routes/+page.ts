import * as  nonprofitInfo  from "$lib/nonprofitData"
import type { PageLoad } from "@sveltejs/kit"

export function load(event): PageLoad  {
  return {
    pebblrNonprofits: nonprofitInfo
  }
  
}