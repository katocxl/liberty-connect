import { ExpoConfig } from "expo/config";

const scheme = "myapp";
const expoConfig: ExpoConfig = {
  name: "LibertyConnect",
  slug: "libertyconnect",
  scheme,
  ios: {
    bundleIdentifier: "com.example.libertyconnect",
    associatedDomains: ["applinks:example.com"]
  },
  android: {
    package: "com.example.libertyconnect",
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme }, { host: "example.com", scheme: "https" }],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  experiments: { typedRoutes: true }
};

export default expoConfig;
