const BLACK_SLACK_ICON_BASE64: string =
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACx\
jwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFQSURBVDhPlVNLasNADDX+f8DFNgSvvUzBV3C7\
bA6Qg5TepMv2FO0qZwhO1tkF2lsU6r43SLanMaF9IN5Y0kgaSXauoSiK2yAIPqMo6pumuRH13xHH\
8RNooIRhuPM875QkyYsx/kbbtis5jqjregMyAeZy4YtMjDqkafrM76qq7lH2u+u639SroIIv9bHg\
+/4JZBxQ6pHnJYHtALbB5vB9OF5cQAPPqO4R9r3qUN0deAKMPci6yAtZlm27rvPx7eR5vlUbnvZG\
3QiOCWQFYFbwCAYCzjgO7Aua+8AJgddOWZZr+dho0+is2RUS1EqESpl8AjsPMkYp22Tnc+Z9UJHn\
T+D4QGrcMysbqbq5wL5b3E4Yro3xyFHzLKO3wSVRBxX2hU+T6owP9ajOXmlZTysjRdbZwtLaGyDq\
K38Y8LhYyMgf6n+Q7ezRwA+OWdQLcJwfzVGEqNv61lYAAAAASUVORK5CYII=";

function main() {
  getSlackStatus().then((status) => console.log(bitbarMessage(status)));
}

async function getSlackStatus(): Promise<SlackStatus> {
  const response = await fetch(
    "https://status.slack.com/api/v2.0.0/current",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const json = await response.json();

  const status = json["status"];
  const incidents: Incident[] = json["active_incidents"].map(
    (incident_json: { [x: string]: string }) => {
      return new Incident(incident_json["title"], incident_json["url"]);
    },
  );

  return new SlackStatus(status, incidents);
}

class SlackStatus {
  private _status: string;
  private _incidents: Incident[];

  constructor(status: string, incidents: Incident[]) {
    this._status = status;
    this._incidents = incidents;
  }

  ok(): boolean {
    return this._status === "ok";
  }

  incidents(): Incident[] {
    return this._incidents;
  }
}

class Incident {
  private _description: string;
  private _url: string;

  constructor(description: string, url: string) {
    this._description = description;
    this._url = url;
  }

  description(): string {
    return this._description;
  }

  url(): string {
    return this._url;
  }
}

function bitbarMessageHeader(slackStatus: SlackStatus): string {
  if (slackStatus.ok()) {
    return "✓ | font='PilGi Regular' image=" + BLACK_SLACK_ICON_BASE64;
  } else {
    return "✕ | color=red image=" + BLACK_SLACK_ICON_BASE64;
  }
}

function bitbarMessage(slackStatus: SlackStatus): string {
  const incident_messages = slackStatus.incidents().map((incident) =>
    incident.description() + " | href=" + incident.url()
  ).join("\n");
  return bitbarMessageHeader(slackStatus) + "\n" + "---" + "\n" +
    incident_messages;
}

main();

export {};
