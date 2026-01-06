// Hetzner Cloud API Type Definitions

// Response format enum
export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Server types
export interface HetznerServer {
  id: number;
  name: string;
  status: "running" | "initializing" | "starting" | "stopping" | "off" | "deleting" | "rebuilding" | "migrating" | "unknown";
  public_net: {
    ipv4: {
      ip: string;
    } | null;
    ipv6: {
      ip: string;
    } | null;
  };
  server_type: {
    id: number;
    name: string;
    description: string;
    cores: number;
    memory: number;
    disk: number;
  };
  datacenter: {
    id: number;
    name: string;
    description: string;
    location: {
      id: number;
      name: string;
      city: string;
      country: string;
    };
  };
  image: {
    id: number;
    name: string;
    description: string;
    os_flavor: string;
    os_version: string;
  } | null;
  labels: Record<string, string>;
  created: string;
}

export interface HetznerServerType {
  id: number;
  name: string;
  description: string;
  cores: number;
  memory: number;
  disk: number;
  prices: {
    location: string;
    price_hourly: {
      net: string;
      gross: string;
    };
    price_monthly: {
      net: string;
      gross: string;
    };
  }[];
  architecture: string;
  cpu_type: string;
}

export interface HetznerImage {
  id: number;
  name: string;
  description: string;
  os_flavor: string;
  os_version: string;
  type: "system" | "snapshot" | "backup" | "app";
  status: "available" | "creating" | "unavailable";
  architecture: string;
}

export interface HetznerLocation {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  network_zone: string;
}

export interface HetznerSSHKey {
  id: number;
  name: string;
  fingerprint: string;
  public_key: string;
  labels: Record<string, string>;
  created: string;
}

export interface HetznerAction {
  id: number;
  command: string;
  status: "running" | "success" | "error";
  progress: number;
  started: string;
  finished: string | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// API Response wrappers
export interface ListServersResponse {
  servers: HetznerServer[];
}

export interface GetServerResponse {
  server: HetznerServer;
}

export interface CreateServerResponse {
  server: HetznerServer;
  action: HetznerAction;
  root_password: string | null;
}

export interface ServerActionResponse {
  action: HetznerAction;
}

export interface ListServerTypesResponse {
  server_types: HetznerServerType[];
}

export interface ListImagesResponse {
  images: HetznerImage[];
}

export interface ListLocationsResponse {
  locations: HetznerLocation[];
}

export interface ListSSHKeysResponse {
  ssh_keys: HetznerSSHKey[];
}

export interface GetSSHKeyResponse {
  ssh_key: HetznerSSHKey;
}

export interface CreateSSHKeyResponse {
  ssh_key: HetznerSSHKey;
}

// API Error
export interface HetznerAPIError {
  error: {
    code: string;
    message: string;
  };
}
