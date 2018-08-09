interface OrgListResult {
  result: Result;
  status: number;
}

interface Result {
  nonScratchOrgs: NonScratchOrg[];
  scratchOrgs: any[];
}

interface NonScratchOrg {
  accessToken: string;
  connectedStatus: string;
  instanceUrl: string;
  lastUsed: string;
  loginUrl: string;
  orgId: string;
  username: string;
  alias?: string;
  defaultMarker?: string;
  isDefaultDevHubUsername?: boolean;
  isDevHub?: boolean;
  isDefaultUsername?: boolean;
}
