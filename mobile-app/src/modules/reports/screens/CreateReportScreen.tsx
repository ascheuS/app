import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { CreateReportDTO } from '../../../types/reportes';
import { mockReportService } from '../../../mocks/reports';

export const CreateReportScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');

    const handleSubmit = async () => {
        try {
            const reportData: CreateReportDTO = {
                title,
                description,
                area,
                severity: 'medium', // Por defecto
                photos: [] // Por ahora sin fotos
            };

            await mockReportService.createReport(reportData);
            // Aquí irías a la pantalla anterior o mostrarías un mensaje de éxito
            
        } catch (error) {
            console.error('Error al crear reporte:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Nuevo Reporte</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Título del reporte"
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <TextInput
                style={styles.input}
                placeholder="Área"
                value={area}
                onChangeText={setArea}
            />

            <Button 
                title="Crear Reporte" 
                onPress={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15
    }
});