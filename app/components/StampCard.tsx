import React from "react";
import { Card, Paragraph, Title } from "react-native-paper";

interface StampCardProps {
  log: any;
}

export default function StampCard({ log }: StampCardProps) {
  return (
    <Card style={{ marginTop: 20 }}>
      <Card.Content>
        <Title>{log.type === "IN" ? "Incheckning" : "Utcheckning"}</Title>
        <Paragraph>Namn: {log.name}</Paragraph>
        <Paragraph>Personnummer: {log.personnummer}</Paragraph>
        <Paragraph>Datum: {log.date}</Paragraph>
        <Paragraph>Tid: {log.time}</Paragraph>
        <Paragraph>
          Plats: {log.location.street}, {log.location.city}, {log.location.region}
        </Paragraph>
      </Card.Content>
    </Card>
  );
}
