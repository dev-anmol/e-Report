import { serverFetch } from "./server-api";

export type PoliceStation = {
  id: string;
  name: string;
};

export async function fetchPoliceStations(): Promise<PoliceStation[]> {
  return serverFetch<PoliceStation[]>("/police-stations");
}
