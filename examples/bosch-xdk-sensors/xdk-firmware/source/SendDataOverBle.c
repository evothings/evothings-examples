/**
 * This software is copyrighted by Bosch Connected Devices and Solutions GmbH, 2016.
 * The use of this software is subject to the XDK SDK EULA
 *
 * Contributors:
 * Evothings AB
 */
//lint -esym(956,*) /* Suppressing "Non const, non volatile static or external variable" lint warning*/

/* module includes ********************************************************** */

/* system header files */
#include <stdio.h>
#include <string.h>
#include "BCDS_Basics.h"

/* additional interface header files */
#include "BCDS_Assert.h"
#include "PTD_portDriver_ph.h"
#include "PTD_portDriver_ih.h"
#include "FreeRTOS.h"
#include "timers.h"
#include "task.h"
#include "XdkSensorHandle.h"
#include "BLE_stateHandler_ih.h"
#include "BLE_serialDriver_ih.h"
#include "BleAlpwDataExchange_Server.h"
#include "URU_usbResetUtility_ih.h"

/* sensor header files */
#include "BCDS_Accelerometer.h"
#include "BCDS_Gyroscope.h"
#include "BCDS_Magnetometer.h"
#include "BCDS_Environmental.h"
#include "BCDS_LightSensor.h"

/* own header files */
#include "SendDataOverBle.h"

/* constant definitions ***************************************************** */

/* local variables ********************************************************** */
static xTimerHandle bleTransmitTimerHandle; /**< variable to store timer handle*/
static xTaskHandle bleTransmitTaskHandle; /**< task handle for bleAppHandler API */
static uint16_t bleConnectionHandle; /**< BLE connection handler for Send or Receive to host */
static uint8_t bleTransmitStatus = NUMBER_ZERO; /**< Validate the repeated start flag */
static volatile uint8_t isInterruptHandled = ENABLE_FLAG;
static uint8_t recievedData[MAX_DEVICE_LENGTH];
static int sRound = 0;

/* global variables ********************************************************* */

/* inline functions ********************************************************* */

/* local functions ********************************************************** */

/**
 * @brief		Bluetooth connect/ disconnect callback function
 *
 * @param[in] 	 connectionDetails  the connection status and the remote device address
 *
 */
static void notificationCallback(BLE_connectionDetails_t connectionDetails)
{

    switch (connectionDetails.connectionStatus)
    {
    case BLE_CONNECTED_TO_DEVICE:
        printf("Device connected  : \r\n");
        break;
    case BLE_DISCONNECTED_FROM_DEVICE:
        printf("Device Disconnected   : \r\n");
        break;
    default:
        /* Assertion Reason : "invalid status of Bluetooth Device" */
        assert(false);
        break;
    }
}

/**
 * @brief API called by xtimerPendFunctionCallFromISR function, which is registered during the USB ISR
 *
 * @param [in]callBackParam1 data buffer
 *
 * @param [in]callBackParam2 length
 */
static void interruptHandling(void *callBackParam1, uint32_t callBackParam2)
{
    BLE_deviceState_t modeConfigured;
    BLE_returnStatus_t retValue = BLE_FAILURE;
    switch (recievedData[NUMBER_ZERO])
    {
    case SET_IDLE_MODE:
        retValue = BLE_setMode(BLE_IDLE);
        if (BLE_SUCCESS == retValue)
        {
            printf("enabling idle mode\r\n");
        }
        else
        {
            printf("enabling idle mode failed\r\n");
        }
        break;
    case SET_DISCOVERABLE_MODE:
        retValue = BLE_setMode(BLE_DISCOVERABLE);
        if (BLE_SUCCESS == retValue)
        {
            printf("enabling discoverable mode\r\n");
        }
        else
        {
            printf("enabling discoverable mode failed\r\n");
        }
        break;
    case SET_SLEEP_MODE:
        retValue = BLE_setMode(BLE_NORMAL_SLEEP);
        if (BLE_SUCCESS == retValue)
        {
            printf("enabling sleep mode\r\n");
        }
        else
        {
            printf("enabling sleep mode failed\r\n");
        }
        break;
    case GET_DEVICE_MODE:
        retValue = BLE_getMode(&modeConfigured);
        if (BLE_SUCCESS == retValue)
        {
            switch (modeConfigured)
            {
            case BLE_DEVICE_IN_IDLE:
                printf("Device is in Idle Sate\r\n");
                break;
            case BLE_DEVICE_IN_DISCOVERABLE:
                printf("Device is in Discoverable Sate\r\n");
                break;
            case BLE_DEVICE_IN_SLEEP:
                printf("Device is in sleep Sate\r\n");
                break;
            case BLE_DEVICE_IN_CONNECTED:
                printf("Device is Connected to a Host\r\n");
                break;
            default:
                break;
            }
        }
        else
        {
            printf("Reading mode failed\r\n");
        }
        break;
    default:
        break;

    }

    /* re-enable  the usb interrupt flag*/
    isInterruptHandled = ENABLE_FLAG;
    UNUSED_PARAMETER(callBackParam1);
    UNUSED_PARAMETER(callBackParam2);
}

/** The function to get and transfer the accel data using BLE alpwise DataExchange service
 *
 * @brief		 Gets the raw data from BMA280 Accel and transfer through the alphwise DataExchange service on BLE
 *
 * @param[in] 	 pvParameters RTOS task should be defined with the type void *(as argument)
 */
static void bleDataTransmit(void *pvParameters)
{
    BCDS_UNUSED(pvParameters);

    /* return value for BLE SendData */
    BleStatus bleSendReturn;

    /* Return value for software timer */
    int8_t timerReturnVal;

    Retcode_T advancedApiRetValue = (Retcode_T) RETCODE_FAILURE;

    /* buffer for accel data receive function */
	uint8_t accelDataRecRaw[SENSOR_RECEIVELENGTH] =
	{ 0 };
	uint8_t accelDataRec[SENSOR_RECEIVELENGTH] =
	{ 0 };

	uint8_t gyroDataRecRaw[SENSOR_RECEIVELENGTH] =
	{ 0 };
	uint8_t gyroDataRec[SENSOR_RECEIVELENGTH] =
	{ 0 };

	uint8_t magDataRecRaw[SENSOR_RECEIVELENGTH] =
	{ 0 };
	uint8_t magDataRec[SENSOR_RECEIVELENGTH] =
	{ 0 };

	uint8_t envDataRecRaw[SENSOR_RECEIVELENGTH] =
	{ 0 };
	uint8_t envDataRec[SENSOR_RECEIVELENGTH] =
	{ 0 };

	uint8_t lightDataRecRaw[SENSOR_RECEIVELENGTH] =
	{ 0 };
	uint8_t lightDataRec[SENSOR_RECEIVELENGTH] =
	{ 0 };

	/** structure variable to hold the accel raw data*/
	Accelerometer_XyzData_T getaccelDataRaw =
	{ INT32_C(0), INT32_C(0), INT32_C(0) };
	Accelerometer_XyzData_T getaccelData =
	{ INT32_C(0), INT32_C(0), INT32_C(0) };

	Gyroscope_XyzData_T getgyroDataRaw =
	{ INT32_C(0), INT32_C(0), INT32_C(0) };
	Gyroscope_XyzData_T getgyroData =
	{ INT32_C(0), INT32_C(0), INT32_C(0) };

	Magnetometer_XyzData_T getMagDataRaw =
	{ INT32_C(0), INT32_C(0), INT32_C(0), INT32_C(0) };
	Magnetometer_XyzData_T getMagData =
	{ INT32_C(0), INT32_C(0), INT32_C(0), INT32_C(0) };

	Environmental_LsbData_T getEnvDataRaw =
	{ INT32_C(0), UINT32_C(0), UINT32_C(0) };
	Environmental_Data_T getEnvData =
	{ INT32_C(0), INT32_C(0), INT32_C(0) };

	uint16_t getLightDataRaw = UINT16_C(0);
	uint32_t getLightData = UINT32_C(0);

	/*get accel data*/
	advancedApiRetValue = Accelerometer_readXyzLsbValue(
			xdkAccelerometers_BMA280_Handle, &getaccelDataRaw);
	advancedApiRetValue = Accelerometer_readXyzGValue(
			xdkAccelerometers_BMA280_Handle, &getaccelData);

	advancedApiRetValue = Gyroscope_readXyzValue(
			xdkGyroscope_BMG160_Handle,	&getgyroDataRaw);
	advancedApiRetValue = Gyroscope_readXyzDegreeValue(
			xdkGyroscope_BMG160_Handle, &getgyroData);

	advancedApiRetValue = Magnetometer_readXyzLsbData(
			xdkMagnetometer_BMM150_Handle, &getMagDataRaw);
	advancedApiRetValue = Magnetometer_readXyzTeslaData(
			xdkMagnetometer_BMM150_Handle, &getMagData);

	advancedApiRetValue = Environmental_readDataLSB(
			xdkEnvironmental_BME280_Handle, &getEnvDataRaw);
	advancedApiRetValue = Environmental_readData(
			xdkEnvironmental_BME280_Handle,	&getEnvData);

	advancedApiRetValue = LightSensor_readRawData(
			xdkLightSensor_MAX44009_Handle, &getLightDataRaw);
	advancedApiRetValue = LightSensor_readLuxData(
			xdkLightSensor_MAX44009_Handle, &getLightData);

	if ( RETCODE_OK == advancedApiRetValue)
	{
		/*Copying the Accel value into BLE-Buffer*/
		sprintf((char*) accelDataRecRaw, "ar=x%ldy%ldz%ld",
				(long int) getaccelDataRaw.xAxisData, (long int) getaccelDataRaw.yAxisData, (long int) getaccelDataRaw.zAxisData);
		sprintf((char*) accelDataRec, "a=x%ldy%ldz%ld",
				(long int) getaccelData.xAxisData, (long int) getaccelData.yAxisData, (long int) getaccelData.zAxisData);

		sprintf((char*) gyroDataRecRaw, "gr=x%ldy%ldz%ld",
				(long int) getgyroDataRaw.xAxisData, (long int) getgyroDataRaw.yAxisData, (long int) getgyroDataRaw.zAxisData);
		sprintf((char*) gyroDataRec, "g=x%ldy%ldz%ld",
				(long int) getgyroData.xAxisData, (long int) getgyroData.yAxisData, (long int) getgyroData.zAxisData);

		sprintf((char*) magDataRecRaw, "mr=x%ldy%ldz%ld",
				(long int) getMagDataRaw.xAxisData, (long int) getMagDataRaw.yAxisData, (long int) getMagDataRaw.zAxisData);
		sprintf((char*) magDataRec, "m=x%ldy%ldz%ld",
				(long int) getMagData.xAxisData, (long int) getMagData.yAxisData, (long int) getMagData.zAxisData);

		sprintf((char*) envDataRecRaw, "er=p%ldt%ldh%ld",
				(long int) getEnvDataRaw.pressure, (long int) getEnvDataRaw.temperature, (long int) getEnvDataRaw.humidity);
		sprintf((char*) envDataRec, "e=p%ldt%ldh%ld",
				(long int) getEnvData.pressure, (long int) getEnvData.temperature, (long int) getEnvData.humidity);

		sprintf((char*) lightDataRecRaw, "lr=%ld",
				(long int) getLightDataRaw);
		sprintf((char*) lightDataRec, "l=%ld",
				(long int) getLightData);

	}
	else
	{
		printf("BMA280 XYZ Data read FAILED\n\r");
	}

	/*Transmitting the Accel value into target device via Alphwise DataExchange service */
	switch(sRound) {
	case 0:
		sRound = 1;
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) accelDataRecRaw, BLETRANSMITLENGTH);
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) accelDataRec, BLETRANSMITLENGTH);
		break;
	case 1:
		sRound = 2;
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) gyroDataRecRaw, BLETRANSMITLENGTH);

		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) gyroDataRec, BLETRANSMITLENGTH);
		break;
	case 2:
		sRound = 3;
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) magDataRecRaw, BLETRANSMITLENGTH);
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) magDataRec, BLETRANSMITLENGTH);
		break;
	case 3:
		sRound = 4;
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) envDataRecRaw, BLETRANSMITLENGTH);

		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) envDataRec, BLETRANSMITLENGTH);
		break;
	case 4:
		sRound = 0;
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) lightDataRecRaw, BLETRANSMITLENGTH);
		bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle,
				(uint8_t*) lightDataRec, BLETRANSMITLENGTH);
		break;
	}

    /*Device Disconnect and data are discarded by Alphwise DataExchange Service */
    if (bleSendReturn == BLESTATUS_FAILED)
    {

        /* clearing the flag */
        bleTransmitStatus = NUMBER_ZERO;

        /* Terminating the Accel data transmission timer */
        timerReturnVal = xTimerStop(bleTransmitTimerHandle,
                NUMBER_ZERO);

        /* BLE timer stop fail case */
        if (TIMER_NOT_ENOUGH_MEMORY == timerReturnVal)
        {
            /* Assertion Reason : "This software timer was not stopped, Due to Insufficient heap memory" */
            assert(false);
        }

    }
    else
    {
        /* Do nothing */
    }

}

/** The function used to initialize the BLE Device and handle, various of event in the state machine
 *
 * @brief BLE device Initialization and handling the BLE events in state machine i.e Device connect/discover/Sleep etc
 *
 * @param[in] pvParameters RTOS task should be defined with the type void *(as argument)
 */
static void bleAppHandler(void *pParameters)
{
    BCDS_UNUSED(pParameters); /* to quiet warnings */

    /* return variable for stack receive status from base band */
    BLE_return_t bleTrsprtRetVal;

    /* return variable for BLE state handler */
    uint8_t bleStateHandleRetVal;

    for (;;)
    {

        /* Notify the BLE Stack that some data have been received from the Base band(Chip) or Host */
        bleTrsprtRetVal = BLE_hciReceiveData();

        /* This function is used to run the BLE stack and register a BLE device with the specified role */
        bleStateHandleRetVal = BLE_coreStateMachine();

        UNUSED_PARAMETER(bleTrsprtRetVal);
        UNUSED_PARAMETER(bleStateHandleRetVal);
    }
}

/**
 * @brief   This function callback used in ALPWISE Data Exchange Profile to transfer/receive BLE data
 *
 * @param[in] event: current device state or status
 *
 * @param[in] status: Event status i.e BLESTATUS_SUCCESS or BLESTATUS_FAILURE
 *
 * @param[in] parms : This void data pointer has more information of event i.e connection host data/event,
 *                    status,command etc
 */
static void bleAlpwDataExchangeService(BleAlpwDataExchangeEvent event, BleStatus status, void *parms)
{
    BleStatus bleSendReturn = BLESTATUS_FAILED;
    /* check the Host side receive event */
    if ((BLEALPWDATAEXCHANGE_EVENT_RXDATA == event)
            && (BLESTATUS_SUCCESS == status)
            && (parms))
    {
        BleAlpwDataExchangeServerRxData *rxData = (BleAlpwDataExchangeServerRxData *) parms;
        uint8_t bleReceiveBuffer[rxData->rxDataLen];

        /* instance for BLE connection handle */
        bleConnectionHandle = rxData->connHandle;

        /* copy received data to local buffer */
        /* Assertion Reason : The local receive buffer must be able to hold the received data.  */
        assert(rxData->rxDataLen <= (uint8_t )sizeof(bleReceiveBuffer));

        memcpy(bleReceiveBuffer, rxData->rxData, rxData->rxDataLen);

        /* make sure that the received string is null-terminated */
        bleReceiveBuffer[rxData->rxDataLen] = '\0';

        /* validate received data */
        if ((NUMBER_ZERO == strcmp((const char *) bleReceiveBuffer, "start"))
                && (NUMBER_ZERO == bleTransmitStatus))
        {
            if (BLESTATUS_FAILED != BLEALPWDATAEXCHANGE_SERVER_SendData(
                    bleConnectionHandle, (uint8_t*) "X      Y      Z",
                    sizeof("X      Y      Z") - 1))
            {
                /* start accelerometer data transmission timer */
                static_assert((portTICK_RATE_MS != 0), "Tick rate MS is zero");
                if (pdTRUE != xTimerStart(bleTransmitTimerHandle, (TRANSMIT_DELAY/portTICK_RATE_MS)))
                {
                    /* Assertion REason : Failed to start software timer. Check command queue size of software timer service*/
                    assert(false);
                }

                bleTransmitStatus = NUMBER_ONE;
            }
        }
        else if ((NUMBER_ZERO == strcmp((const char *) bleReceiveBuffer, "end"))
                && (bleTransmitStatus == NUMBER_ONE))
        {
            /* stop accelerometer data transmission timer */
            if (pdTRUE != xTimerStop(bleTransmitTimerHandle, NUMBER_ZERO))
            {
                /* Assertion Reason: Failed to start software timer. Check command queue size of software timer service. */
                assert(false);
            }

            bleTransmitStatus = NUMBER_ZERO;

            /* send termination message to host */
            bleSendReturn = BLEALPWDATAEXCHANGE_SERVER_SendData(bleConnectionHandle, (uint8_t*) "Transfer Terminated!", sizeof("Transfer Terminated!") - 1);
            if (bleSendReturn == BLESTATUS_FAILED)
            {
                assert(false);
            }
        }
    }
}

/**
 * @brief  The bleAppServiceRegister is used to register the BLE Alpwise DataExchange
 *         service's into attribute database.
 */
static void bleAppServiceRegister(void)
{
    /* flag for service registry return */
    BleStatus serviceRegistryStatus;

    /* Alpwise data Exchange Service Register*/
    serviceRegistryStatus = BLEALPWDATAEXCHANGE_SERVER_Register(bleAlpwDataExchangeService);

    /* Checking data NULL pointer condition */
    if (serviceRegistryStatus == BLESTATUS_FAILED)
    {
        /* Assertion Reason:   "BLE Service registry was failure" */
        assert(false);
    }

}

/**
 * @brief USB recieve call back function
 *
 * @param[in] usbRcvBuffer recieved data
 *
 * @param[in] count length of the data received
 */
void callbackIsr(uint8_t *usbRcvBuffer, uint16_t count)
{
    if (ENABLE_FLAG == isInterruptHandled)
    {
        isInterruptHandled = DISABLE_FLAG;

        /* add to timer queue*/
        portBASE_TYPE xHigherPriorityTaskWoken = pdFALSE;
        if (xTimerPendFunctionCallFromISR(interruptHandling, NULL, UINT8_C(0), &xHigherPriorityTaskWoken) == pdPASS)
        {
            memcpy(recievedData, usbRcvBuffer, count);
            portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
        }
        else
        {
            assert(false);
        }

    }
}
/* global functions ********************************************************* */

/** the function initializes the BMA and its process
 *
 * @brief The function initializes BMA(accelerometer)creates a auto reloaded
 * timer task which gets and transmit the accel raw data via BLE
 */
void init(void)
{

    /* return value for BLE stack configuration */
    BleStatus appInitReturn = BLESTATUS_FAILED;
    BLE_notification_t configParams;
    BLE_returnStatus_t returnValue;
    URU_return_t UsbReturnValue = URU_FAILURE;
    BLE_status BleReturnValue = BLESTATUS_FAILED;
    /* return value for BLE task create */
    int8_t appTaskInitReturn = TIMER_NOT_ENOUGH_MEMORY;
    Retcode_T advancedApiRetValue = (Retcode_T) RETCODE_FAILURE;

    /*registers the Application USB ISR */
    UsbReturnValue = URU_registerApplicationISR((URU_usbAppCallback) callbackIsr);
    if (UsbReturnValue != URU_SUCCESS)
    {
        /* assertion reason : registering Application USB ISR failed*/
        assert(false);
    }
    /* avoid synchronize problem to get proper BMA280 chipID this delay is mandatory */
    static_assert((portTICK_RATE_MS != 0), "Tick rate MS is zero");
    vTaskDelay((portTickType) 1 / portTICK_RATE_MS);

    /*initialize accel*/
    advancedApiRetValue = Accelerometer_init(xdkAccelerometers_BMA280_Handle);

    if ( RETCODE_OK == advancedApiRetValue)
    {
        printf("Accelerometer initialization SUCCESS\n\r");
    }
    else
    {
        printf("Accelerometer initialization FAILED\n\r");
    }

    advancedApiRetValue = Gyroscope_init(xdkGyroscope_BMG160_Handle);
    if ( RETCODE_OK == advancedApiRetValue)
    {
        printf("Gyroscope initialization SUCCESS\n\r");
    }
    else
    {
        printf("Gyroscope initialization FAILED\n\r");
    }

    advancedApiRetValue = Magnetometer_init(xdkMagnetometer_BMM150_Handle);
    if ( RETCODE_OK == advancedApiRetValue)
    {
        printf("Magnetometer initialization SUCCESS\n\r");
    }
    else
    {
        printf("Magnetometer initialization FAILED\n\r");
    }

    advancedApiRetValue = Environmental_init(xdkEnvironmental_BME280_Handle);
    if ( RETCODE_OK == advancedApiRetValue)
    {
        printf("Environmental initialization SUCCESS\n\r");
    }
    else
    {
        printf("Environmental initialization FAILED\n\r");
    }

    advancedApiRetValue = LightSensor_init(xdkLightSensor_MAX44009_Handle);
    if ( RETCODE_OK == advancedApiRetValue)
    {
        printf("LightSensor initialization SUCCESS\n\r");
    }
    else
    {
        printf("LightSensor initialization FAILED\n\r");
    }

    returnValue = BLE_setDeviceName((uint8_t *) BLE_DEVICE_NAME, BLE_DEVICE_NAME_LENGTH);
    if (returnValue != BLE_SUCCESS)
    {
        /* assertion reason : invalid device name */
        assert(false);
    }

    /* enable and register notification callback for bluetooth device connect and disconnect*/
    configParams.callback = notificationCallback;
    configParams.enableNotification = BLE_ENABLE_NOTIFICATION;

    returnValue = BLE_enablenotificationForConnect(configParams);
    if (returnValue != BLE_SUCCESS)
    {
        /* assertion reason : Enable Notification Failed*/
        assert(false);
    }
    /* Registering the BLE Services  */
    BleReturnValue = BLE_customServiceRegistry(bleAppServiceRegister);
    if (BleReturnValue != BLESTATUS_SUCCESS)
    {
        /* assertion reason : custom Service Registry Failed*/
        assert(false);
    }
    /* Initialize the whole BLE stack */
    appInitReturn = BLE_coreStackInit();

    if (BLESTATUS_FAILED == (appInitReturn))
    {
        /* Assertion Reason : BLE Boot up process Failed, */
        assert(false);
    }
    else
    {

        /* create task for BLE state machine */
        appTaskInitReturn = xTaskCreate(bleAppHandler, (const char * const ) "BLE", STACK_SIZE_FOR_TASK, NULL, (uint32_t) BLE_TASK_PRIORITY, &bleTransmitTaskHandle);

        /* BLE task creatioon fail case */
        if (pdPASS != appTaskInitReturn)
        {
            /* Assertion Reason : BLE Task was not created, Due to Insufficient heap memory */
            assert(false);
        }
        uint32_t Ticks = TRANSMIT_DELAY;

        if (Ticks != UINT32_MAX) /* Validated for portMAX_DELAY to assist the task to wait Infinitely (without timing out) */
        {
            Ticks /= portTICK_RATE_MS;
        }
        if (UINT32_C(0) == Ticks) /* ticks cannot be 0 in FreeRTOS timer. So ticks is assigned to 1 */
        {
            Ticks = UINT32_C(1);
        }
        /* create timer task to get and transmit accel data via BLE for every one second automatically*/
        bleTransmitTimerHandle = xTimerCreate((char * const ) "bleDataTransmit", Ticks, TIMER_AUTORELOAD_ON, NULL, bleDataTransmit);

        if (NULL == bleTransmitTimerHandle)
        {
            assert(false);
        }
    }
}

/**
 * the function Deinitializes the timer task
 *
 *  @brief The function Deinitializes / deletes the timer that is created to
 *  get BMA280(accelerometer) and transfer through BLE
 */
void deinit(void)
{
    /*Suspend the BLE task*/
    vTaskSuspend(&bleTransmitTaskHandle);
}

/**
 * @brief This is a template function where the user can write his custom application.
 *
 */
void appInitSystem(xTimerHandle xTimer)
{
    BCDS_UNUSED(xTimer);
    init();
}
/** ************************************************************************* */
